const { connectDatabase } = require('./src/database/db')
require('dotenv').config();
const { app } = require('./src/app')
connectDatabase()
.then(() => {
  app.listen(process.env.PORT || 4000, () => {
    console.log(`Server running at  http://localhost:${process.env.PORT}`);
    
  })
})
.catch(error => console.error('Database connection failed: ' + error))