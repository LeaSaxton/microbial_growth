const { Router } = require('express');
const express = require ('express'); 

const microbe_router = express.Router(); 
microbe_router.use(function(req,res,next){
    console.log("Received Request"); 
    next(); 
}); 
microbe_router.get ('/greeting/:name', function (req,res){
    res.send(`hello world ${req.params.name}!`); 

}); 
module.exports=microbe_router; 

const sqlite3 = require ('sqlite3').verbose(); 
const db = new sqlite3.Database('./microdb-2.sqlite'); 

microbe_router.get('/authors', function(req, res){
    const query = 'SELECT * FROM authors; '; 
    db.all(query, [], function (err, rows){
        if(err){
            throw err; 
        }
        res.json(rows); 
    });
});

microbe_router.get("/authors/count", function(req, res){
    const query = "SELECT COUNT(*) AS author_count FROM authors;"; 
    db.get(query, [], function (err, row){
        if(err){
            throw err; 
        }
        res.json(row); 
    }); 
});

microbe_router.get('/experiments/:medium/:mintemp/:maxtemp',
        function (req, res){
    const query='SELECT * FROM experiments WHERE medium = ?'+
    'AND temperature >= ? AND temperature <=?;';
    const parameters = [
        req.params.medium,
        req.params.mintemp, 
        req.params.maxtemp
    ];
    db.all(query, parameters, function(err,rows){
        if(err){
            throw err;
        }
        res.json(rows);
        });
    });

microbe_router.get('/datapoints/:experiment_id',
function (req, res){
const query='SELECT cfu, time FROM datapoints WHERE experiment_id = ?;';
const parameters = [
    req.params.experiment_id,
    req.params.cfu
];
db.all(query, parameters, function(err,rows){
    if(err){
        throw err;
    }
    res.json(rows);
    });
});

const rscript = require('r-script');

microbe_router.get('/fit/growth/:experiment_id', function(req, res){
    const query = 'SELECT time, cfu FROM datapoints '+ "WHERE experiment_id = ? ORDER BY time;";
    const parameters = [
        req.params.experiment_id
    ];
    db.all(query, parameters, function (err, rows) {
        if (err) {
            throw err; }
            const r_input = {
                times: [],
                cfus: [] 
        };
            for (let i = 0; i < rows.length; i++) {
                r_input.times.push(rows[i].time);
                r_input.cfus.push(rows[i].cfu);
            }
            rscript('fit_model.R').data(r_input)
                                   .call(function (err, growth_coef) {
                if (err) {
                    throw err;
                            // Encoding and displaying R error message
                    console.log(String.fromCharCode.apply(null, err));
                        }
                const output = {
                    experiment_id: req.params.experiment_id,
                    growth_coefficient: growth_coef
                        };
                res.json(output);
                    });
            });
});

microbe_router.get('/fit/growth/:medium/:organism', function(req, res){
    const query = 'SELECT temperature, time, cfu FROM experiments JOIN datapoints ON experiments.experiment_id = datapoints.experiment_id'+
    " WHERE organism = ? AND medium = ?;";
    const parameters = [
        req.params.medium,
        req.params.organism
    ];
    db.all(query, parameters, function (err, rows) {
        if (err) {
            throw err; }
            const r_input = {
                times: [],
                cfus: [] , 
                temperatures: []
        };
            for (let i = 0; i < rows.length; i++) {
                r_input.times.push(rows[i].time);
                r_input.cfus.push(rows[i].cfu);
                r_input.temperatures.push(rows[i].temperature);
            }
            console.log(r_input); 
            rscript('fit_model_temp.R').data(r_input)
                                   .call(function (err, df) {
                if (err) {
                    console.log(String.fromCharCode.apply(null, err));
                    throw err;
                            // Encoding and displaying R error message
                    //console.log(String.fromCharCode.apply(null, err));
                        }
                const output = {
                    values: df
                        };
                res.json(output);
                    });
            });
});