'use strict';
const next = require('next');
const port = process.env.PORT || 3001;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const Main = require('./src/main.js');

  const MainApp = new Main();
  //const server = express();

  const server = MainApp.Server.getExpressApp();
  server.get('/', (req, res) => {
    return app.render(req, res, '/?loaded=true', req.query);
  });
  server.get('/a', (req, res) => {
    return app.render(req, res, '/b', req.query);
  });

  server.get('/b', (req, res) => {
    return app.render(req, res, '/a', req.query);
  });

  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on http://localhost:${port}`);
  });
});
