import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@libsql/client';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Create database client
let db;

try {
  db = createClient({
    url: 'file:./local.db',
  });
  
  console.log('Connected to local LibSQL database');
  
  // Initialize database tables
  await initDatabase();
} catch (error) {
  console.error('Failed to connect to database:', error);
  process.exit(1);
}

// Initialize database schema
async function initDatabase() {
  try {
    // Create tasks table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        important BOOLEAN DEFAULT FALSE,
        notes TEXT,
        due_date TEXT,
        list_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    // Create task steps table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS task_steps (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        title TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        due_date TEXT,
        assignee TEXT,
        order_index INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);
    
    // Create lists table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    // Check if default list exists
    const result = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM lists',
    });
    
    // Create default list if no lists exist
    if (result.rows[0].count === 0) {
      const now = new Date().toISOString();
      await db.execute({
        sql: 'INSERT INTO lists (id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        args: ['default', 'My Tasks', '#3B82F6', now, now]
      });
      console.log('Created default list');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Task routes
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM tasks');
    const tasks = await Promise.all(result.rows.map(async task => {
      // Get steps for each task
      const stepsResult = await db.execute({
        sql: 'SELECT * FROM task_steps WHERE task_id = ? ORDER BY order_index',
        args: [task.id]
      });
      
      const steps = stepsResult.rows.map(step => ({
        id: step.id,
        taskId: step.task_id,
        title: step.title,
        completed: Boolean(step.completed),
        dueDate: step.due_date,
        assignee: step.assignee,
        orderIndex: step.order_index,
        createdAt: step.created_at,
        updatedAt: step.updated_at
      }));
      
      return {
        id: task.id,
        title: task.title,
        completed: Boolean(task.completed),
        important: Boolean(task.important),
        notes: task.notes,
        dueDate: task.due_date,
        listId: task.list_id,
        steps,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      };
    }));
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT * FROM tasks WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = result.rows[0];
    
    // Get steps for the task
    const stepsResult = await db.execute({
      sql: 'SELECT * FROM task_steps WHERE task_id = ? ORDER BY order_index',
      args: [id]
    });
    
    const steps = stepsResult.rows.map(step => ({
      id: step.id,
      taskId: step.task_id,
      title: step.title,
      completed: Boolean(step.completed),
      dueDate: step.due_date,
      assignee: step.assignee,
      orderIndex: step.order_index,
      createdAt: step.created_at,
      updatedAt: step.updated_at
    }));
    
    res.json({
      id: task.id,
      title: task.title,
      completed: Boolean(task.completed),
      important: Boolean(task.important),
      notes: task.notes,
      dueDate: task.due_date,
      listId: task.list_id,
      steps,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, completed, important, notes, dueDate, listId, steps = [] } = req.body;
    
    if (!title || !listId) {
      return res.status(400).json({ error: 'Title and listId are required' });
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Begin transaction
    await db.execute('BEGIN');
    
    try {
      // Create task
      await db.execute({
        sql: `
          INSERT INTO tasks 
          (id, title, completed, important, notes, due_date, list_id, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id, 
          title, 
          completed || false, 
          important || false, 
          notes || null, 
          dueDate || null, 
          listId, 
          now, 
          now
        ]
      });
      
      // Create steps
      const createdSteps = await Promise.all(steps.map(async (step, index) => {
        const stepId = uuidv4();
        await db.execute({
          sql: `
            INSERT INTO task_steps
            (id, task_id, title, completed, due_date, assignee, order_index, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            stepId,
            id,
            step.title,
            step.completed || false,
            step.dueDate || null,
            step.assignee || null,
            index,
            now,
            now
          ]
        });
        
        return {
          id: stepId,
          taskId: id,
          title: step.title,
          completed: step.completed || false,
          dueDate: step.dueDate || null,
          assignee: step.assignee || null,
          orderIndex: index,
          createdAt: now,
          updatedAt: now
        };
      }));
      
      // Commit transaction
      await db.execute('COMMIT');
      
      res.status(201).json({
        id,
        title,
        completed: completed || false,
        important: important || false,
        notes: notes || null,
        dueDate: dueDate || null,
        listId,
        steps: createdSteps,
        createdAt: now,
        updatedAt: now
      });
    } catch (error) {
      // Rollback transaction on error
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, important, notes, dueDate, listId, steps } = req.body;
    const now = new Date().toISOString();
    
    // Check if task exists
    const checkResult = await db.execute({
      sql: 'SELECT * FROM tasks WHERE id = ?',
      args: [id]
    });
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Begin transaction
    await db.execute('BEGIN');
    
    try {
      // Update task
      let sql = 'UPDATE tasks SET updated_at = ?';
      const args = [now];
      
      if (title !== undefined) {
        sql += ', title = ?';
        args.push(title);
      }
      
      if (completed !== undefined) {
        sql += ', completed = ?';
        args.push(completed);
      }
      
      if (important !== undefined) {
        sql += ', important = ?';
        args.push(important);
      }
      
      if (notes !== undefined) {
        sql += ', notes = ?';
        args.push(notes);
      }
      
      if (dueDate !== undefined) {
        sql += ', due_date = ?';
        args.push(dueDate);
      }
      
      if (listId !== undefined) {
        sql += ', list_id = ?';
        args.push(listId);
      }
      
      sql += ' WHERE id = ?';
      args.push(id);
      
      await db.execute({ sql, args });
      
      // Update steps if provided
      if (steps !== undefined) {
        // Delete existing steps
        await db.execute({
          sql: 'DELETE FROM task_steps WHERE task_id = ?',
          args: [id]
        });
        
        // Create new steps
        const updatedSteps = await Promise.all(steps.map(async (step, index) => {
          const stepId = step.id || uuidv4();
          await db.execute({
            sql: `
              INSERT INTO task_steps
              (id, task_id, title, completed, due_date, assignee, order_index, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
              stepId,
              id,
              step.title,
              step.completed || false,
              step.dueDate || null,
              step.assignee || null,
              index,
              step.createdAt || now,
              now
            ]
          });
          
          return {
            id: stepId,
            taskId: id,
            title: step.title,
            completed: step.completed || false,
            dueDate: step.dueDate || null,
            assignee: step.assignee || null,
            orderIndex: index,
            createdAt: step.createdAt || now,
            updatedAt: now
          };
        }));
        
        // Get updated task with steps
        const result = await db.execute({
          sql: 'SELECT * FROM tasks WHERE id = ?',
          args: [id]
        });
        
        const task = result.rows[0];
        
        // Commit transaction
        await db.execute('COMMIT');
        
        res.json({
          id: task.id,
          title: task.title,
          completed: Boolean(task.completed),
          important: Boolean(task.important),
          notes: task.notes,
          dueDate: task.due_date,
          listId: task.list_id,
          steps: updatedSteps,
          createdAt: task.created_at,
          updatedAt: task.updated_at
        });
      } else {
        // Get updated task without updating steps
        const result = await db.execute({
          sql: 'SELECT * FROM tasks WHERE id = ?',
          args: [id]
        });
        
        const task = result.rows[0];
        
        // Get existing steps
        const stepsResult = await db.execute({
          sql: 'SELECT * FROM task_steps WHERE task_id = ? ORDER BY order_index',
          args: [id]
        });
        
        const existingSteps = stepsResult.rows.map(step => ({
          id: step.id,
          taskId: step.task_id,
          title: step.title,
          completed: Boolean(step.completed),
          dueDate: step.due_date,
          assignee: step.assignee,
          orderIndex: step.order_index,
          createdAt: step.created_at,
          updatedAt: step.updated_at
        }));
        
        // Commit transaction
        await db.execute('COMMIT');
        
        res.json({
          id: task.id,
          title: task.title,
          completed: Boolean(task.completed),
          important: Boolean(task.important),
          notes: task.notes,
          dueDate: task.due_date,
          listId: task.list_id,
          steps: existingSteps,
          createdAt: task.created_at,
          updatedAt: task.updated_at
        });
      }
    } catch (error) {
      // Rollback transaction on error
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Begin transaction
    await db.execute('BEGIN');
    
    try {
      // Delete steps first (cascade should handle this, but being explicit)
      await db.execute({
        sql: 'DELETE FROM task_steps WHERE task_id = ?',
        args: [id]
      });
      
      // Delete task
      const result = await db.execute({
        sql: 'DELETE FROM tasks WHERE id = ?',
        args: [id]
      });
      
      if (result.rowsAffected === 0) {
        await db.execute('ROLLBACK');
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // Commit transaction
      await db.execute('COMMIT');
      
      res.json({ success: true });
    } catch (error) {
      // Rollback transaction on error
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Task Step routes
app.patch('/api/tasks/:taskId/steps/:stepId', async (req, res) => {
  try {
    const { taskId, stepId } = req.params;
    const { title, completed, dueDate, assignee, orderIndex } = req.body;
    const now = new Date().toISOString();
    
    // Check if step exists
    const checkResult = await db.execute({
      sql: 'SELECT * FROM task_steps WHERE id = ? AND task_id = ?',
      args: [stepId, taskId]
    });
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Step not found' });
    }
    
    // Build update query
    let sql = 'UPDATE task_steps SET updated_at = ?';
    const args = [now];
    
    if (title !== undefined) {
      sql += ', title = ?';
      args.push(title);
    }
    
    if (completed !== undefined) {
      sql += ', completed = ?';
      args.push(completed);
    }
    
    if (dueDate !== undefined) {
      sql += ', due_date = ?';
      args.push(dueDate);
    }
    
    if (assignee !== undefined) {
      sql += ', assignee = ?';
      args.push(assignee);
    }
    
    if (orderIndex !== undefined) {
      sql += ', order_index = ?';
      args.push(orderIndex);
    }
    
    sql += ' WHERE id = ? AND task_id = ?';
    args.push(stepId, taskId);
    
    await db.execute({ sql, args });
    
    // Get updated step
    const result = await db.execute({
      sql: 'SELECT * FROM task_steps WHERE id = ?',
      args: [stepId]
    });
    
    const step = result.rows[0];
    res.json({
      id: step.id,
      taskId: step.task_id,
      title: step.title,
      completed: Boolean(step.completed),
      dueDate: step.due_date,
      assignee: step.assignee,
      orderIndex: step.order_index,
      createdAt: step.created_at,
      updatedAt: step.updated_at
    });
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// List routes
app.get('/api/lists', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM lists');
    const lists = result.rows.map(list => ({
      id: list.id,
      name: list.name,
      icon: list.icon,
      color: list.color,
      createdAt: list.created_at,
      updatedAt: list.updated_at
    }));
    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Failed to fetch lists' });
  }
});

app.get('/api/lists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.execute({
      sql: 'SELECT * FROM lists WHERE id = ?',
      args: [id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    const list = result.rows[0];
    res.json({
      id: list.id,
      name: list.name,
      icon: list.icon,
      color: list.color,
      createdAt: list.created_at,
      updatedAt: list.updated_at
    });
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ error: 'Failed to fetch list' });
  }
});

app.post('/api/lists', async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await db.execute({
      sql: `
        INSERT INTO lists 
        (id, name, icon, color, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [id, name, icon || null, color || '#3B82F6', now, now]
    });
    
    res.status(201).json({
      id,
      name,
      icon: icon || null,
      color: color || '#3B82F6',
      createdAt: now,
      updatedAt: now
    });
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ error: 'Failed to create list' });
  }
});

app.patch('/api/lists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    const now = new Date().toISOString();
    
    // Check if list exists
    const checkResult = await db.execute({
      sql: 'SELECT * FROM lists WHERE id = ?',
      args: [id]
    });
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'List not found' });
    }
    
    // Build update query
    let sql = 'UPDATE lists SET updated_at = ?';
    const args = [now];
    
    if (name !== undefined) {
      sql += ', name = ?';
      args.push(name);
    }
    
    if (icon !== undefined) {
      sql += ', icon = ?';
      args.push(icon);
    }
    
    if (color !== undefined) {
      sql += ', color = ?';
      args.push(color);
    }
    
    sql += ' WHERE id = ?';
    args.push(id);
    
    await db.execute({ sql, args });
    
    // Get updated list
    const result = await db.execute({
      sql: 'SELECT * FROM lists WHERE id = ?',
      args: [id]
    });
    
    const list = result.rows[0];
    res.json({
      id: list.id,
      name: list.name,
      icon: list.icon,
      color: list.color,
      createdAt: list.created_at,
      updatedAt: list.updated_at
    });
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ error: 'Failed to update list' });
  }
});

app.delete('/api/lists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Don't allow deleting the default list
    if (id === 'default') {
      return res.status(400).json({ error: 'Cannot delete the default list' });
    }
    
    // Begin transaction
    await db.execute('BEGIN');
    
    try {
      // Update tasks to move them to the default list
      await db.execute({
        sql: 'UPDATE tasks SET list_id = ? WHERE list_id = ?',
        args: ['default', id]
      });
      
      // Delete the list
      const result = await db.execute({
        sql: 'DELETE FROM lists WHERE id = ?',
        args: [id]
      });
      
      if (result.rowsAffected === 0) {
        await db.execute('ROLLBACK');
        return res.status(404).json({ error: 'List not found' });
      }
      
      // Commit transaction
      await db.execute('COMMIT');
      
      res.json({ success: true });
    } catch (error) {
      // Rollback transaction on error
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Acessível na rede local via: http://10.0.0.146:${PORT}`);
});