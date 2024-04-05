import express from 'express'
import nunjucks from 'nunjucks'
import Database from 'better-sqlite3'
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const db = new Database('./posts.db', { fileMustExist: true })
const app = express()

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT || 3000;
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

nunjucks.configure('./templates', { express: app, autoescape: true })

app.get('/', (req, res) => {
    const statement = db.prepare('SELECT body, author, title, id FROM posts')
    const posts = statement.all()

    res.render('index.html', { posts })
})

app.post('/posts', (req, res) => {
    const { body, author, title } = req.body
    //SQL injection here is possible
    const statement = db.prepare('INSERT INTO posts (title, body, author) VALUES (?, ?, ?)')
    statement.run(title, body, author)
    res.redirect(303, '/');
})


//cool thing that express can do?
app.post('/posts/:post_id/delete', (req, res) => {
    const post_id = req.params.post_id

    const statement = db.prepare('DELETE FROM posts WHERE id = ?')
    statement.run(post_id)

    res.header('Location', '/')
    // res.sendStatus(204)
    res.redirect(303, '/');
})

app.get('/posts/:id', (req, res) => {
    const { id } = req.params
    const statement = db.prepare('SELECT body, author, title, id FROM posts WHERE id = ?')
    const post = statement.get(id)

    res.render('post.html', { post })

})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
