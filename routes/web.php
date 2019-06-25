<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/{name}', "HomeController@name");
Route::post('/{name}', "HomeController@save");
Route::get('/{name}/getImage', "HomeController@getImage");
Route::get('/', function () {
    return view('welcome');
});

