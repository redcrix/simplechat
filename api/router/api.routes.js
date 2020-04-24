module.exports = (app, passport) => {

    // Verify Token
    function verifyToken(req, res, next) {
        // Get auth header value
        const bearerHeader = req.headers['authorization'];
        // Check if bearer is undefined
        if(typeof bearerHeader !== 'undefined') {
          // Split at the space
          console.log(bearerHeader);
          const bearer = bearerHeader.split(' ');
          // Get token from array
          const bearerToken = bearer[1];
          // Set the token
          req.token = bearerToken;
          // Next middleware
            next();
        } else {
          // Forbidden
          res.status(401).send({
            code:401,
            success: false,
            message: 'Authentication Token is not valid'
        });
        }
      }

    const apis = require('../controller/controller');
        app.post('/api/login', apis.login);
        app.post('/api/signup', apis.signup);
        app.post('/api/lat_long', verifyToken, apis.lat_long)
        app.post('/api/chat_box', verifyToken, apis.findOrCreate);
        app.get('/api/chat_list', verifyToken, apis.getOldChatList);
    }