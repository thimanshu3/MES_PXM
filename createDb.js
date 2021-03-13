var mysql = require('mysql');

var con = mysql.createConnection({
    host: "dme-pxm.crdyivm2svkb.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "mes-hanzala",
    database: 'dmepxm'
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query(" ",
     function (err, result) {
        if (err) throw err;
            console.log(result);
     });
});