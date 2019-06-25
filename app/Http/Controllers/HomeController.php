<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HomeController extends Controller
{
    public function name(Request $request,$name)
    {
        return view('paint');
    }
    public function save(Request $request, $name)
    {
        $file = $request->file('photo');
        $file->hashName("a.png") ;
        
        Storage::putFileAs("paint/$name", $file, "$name.png");
        return  "";
    }
    public function getImage( $name)
    {
        if(!Storage::exists("paint/$name/$name.png")){
            return "";
        }
        return base64_encode (Storage::get("paint/$name/$name.png"));
    }
}
