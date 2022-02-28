function errorHandle(res) {
    //原本的吃不到所以再帶一次
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
    res.writeHead(400,headers);
    res.write(JSON.stringify({
        "status": "false",
        "message": "欄位未填寫正確，或著無此todo id", 
    }));
    res.end();
}
//node.js都要經過這個匯出才能給別的檔案用
module.exports = errorHandle;