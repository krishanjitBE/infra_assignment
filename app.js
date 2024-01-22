const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'crud'
});


app.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM demo');
        res.render('index', { items: rows });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving items');
    }
});

app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/create', async (req, res) => {
    

    
    try {
        await pool.execute('INSERT INTO demo (name) VALUES (?)', [req.body.name]);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating item');
    }
});

app.get('/update/:id', async (req, res) => {
    try {
        const [row] = await pool.execute('SELECT * FROM demo WHERE id = ?', [req.params.id]);
        if (!row) {
            return res.status(404).send('Item not found');
        }
        res.render('update', { item: row[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving item');
    }
});

app.post('/update/:id', async (req, res) => {
    try {
        await pool.execute('UPDATE demo SET name = ? WHERE id = ?', [req.body.name, req.params.id]);
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating item');
    }
});

app.get('/delete/:id', async (req, res) => {
    try {
      await pool.execute('DELETE FROM demo WHERE id = ?', [req.params.id]);
      res.redirect('/'); // Redirect to the home page or a list of items
    } catch (error) {
      console.error(error);
      res.status(500).send('Error deleting item');
    }
  });
  

//middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
