var fs = require('fs');
var express = require('express');
var multer  = require('multer');
var path = require('path');
var router = express.Router();
var bodyParser = require('body-parser')

//create application/json
var jsonParser = bodyParser.json();

//create application/x-www-form-urlencoded
var urlencodedParser = bodyParser.urlencoded({extended: false});

var createFolder = function(folder){
    try{
      fs.accessSync(folder);
    }catch( e ){
      fs.mkdirSync(folder);
    }
};

var uploadFolder = './upload/';
createFolder(uploadFolder);

var storage = multer.diskStorage({
destination: function (req, file, cb) {
    cb(null, uploadFolder ); 
},
filename: function (req, file, cb) { 
    cb(null, file.originalname);
}})

var upload = multer({ storage: storage })

// upload page
router.get('/', (req, res)=>{
    console.log(__dirname)
    res.sendFile(path.join(__dirname,'../views/upload.html'))
})

// list page
router.get('/filelist',function(req, res){
    res.sendFile(path.join(__dirname,'../views/filelist.html'))
})

// upload action
router.post('/upload', upload.array('file'), function(req, res) {
    console.dir(req.files)
    
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).send('pls select a file to upload！');
        return;
      }

    // res.send('Success.');
    res.redirect('/filelist')
});

// download file
router.get('/download',function(req,res){
    var filePath = req.query.path;
    console.log('download：'+filePath)
    filePath = path.join(__dirname,'../'+filePath);
    res.attachment(filePath)
    res.sendFile(filePath)
})

// remove file
router.post('/delete', jsonParser, function(req, res, next){
    var filePath = req.body.filePath;
    console.log('delete：'+filePath)

    try {
        fs.unlinkSync(filePath)
        // 重定向到列表页
        res.send('success to delete')
    } catch (error) {
        res.send('fail to remove')
    }
    
})


// file list
router.get('/getFileList',function(req, res, next){
    var filelist = getFileList('upload')
    res.send(filelist)
})

function getFileList(path){
    var filelist = [];
    readFile(path, filelist);

    return filelist;
}


function readFile(path, filelist){
    var files = fs.readdirSync(path);
    files.forEach(walk);

    function walk(file)
    {
        var state = fs.statSync(path+'/'+file)
        if(state.isDirectory()){
            readFile(path+'/'+file, filelist)
        }else{
            var obj = new Object;
            obj.size = state.size;
            obj.name = file;
            obj.path = path+'/'+file;
            filelist.push(obj);
        }
    }
}

module.exports = router;