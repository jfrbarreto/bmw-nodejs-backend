const express = require('express');
// const app = express();
const api = express.Router();
const async = require('async');
const client = require('../database/db');
api.route('/cars').get((req, res) => {
    let carsResult = [];
    client.keys('bmw*', function (error, cars) {
        client.smembers('favorites', function (error, favorites) {
            if (cars && cars.length) {
                cars.sort();
                async.forEachOf(cars, function (value, key, callback) {
                    client.hgetall(value, function (err, carInfo) {
                        if (favorites.includes(carInfo.id)) {
                            carInfo.favorite = true;
                        }
                        carsResult.push(carInfo);
                        callback();
                    });
                }, function (err) {
                    if (err) console.error(err.message);
                    res.json(carsResult);
                });
            }
        });
    });
});
api.route('/favorites').get((req, res) => {
    let favorites = [];
    client.smembers('favorites', function (error, result) {
        if (result && result.length) {
            result.sort();
            async.forEachOf(result, function (value, key, callback) {
                client.hgetall(value, function (err, data) {
                    favorites.push(data);
                    callback();
                });
            }, function (err) {
                if (err) console.error(err.message);
                res.json(favorites);
            });
        }
        else {
            res.json(false);
        }
    });
});
api.route('/add-favorite').post((req, res) => {
    const id = req.body.id.toString();
    client.sadd('favorites', id, function (error, result) {
        res.json(result);
    });
});
api.route('/del-favorite/:id').delete((req, res) => {
    const id = req.params.id;
    client.srem('favorites', id, function (error, result) {
        res.json(result);
    });
});
module.exports = api;
