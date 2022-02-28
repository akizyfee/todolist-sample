
//請求HTTP方法，載入需要的套件，載入另外開設的模組，存放todo的地方
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');
const todos = [];

//表頭 表頭 方法 格式 每個訪問都需要有
const requestListener = (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
    //需要接收BODY的資料，太大會需要多次，on監控只要有data就會開始
    let body = "";
    req.on('data', chunk=>{
        body+=chunk;
    })
    //如果url和方法條件同時達成才進行這個地方
    if(req.url=="/todos" && req.method == "GET"){
        //每個回傳都需要代表頭和狀態碼，200是成功
        res.writeHead(200,headers);
        //需要把東西轉成字串才能印出來
        res.write(JSON.stringify({
            //一個狀態的提示
            "status": "success",
            //要傳回去的資料，連接到一開始自訂存放todo的地方
            "data": [todos], 
        }));
        //一定要有end才能把資料傳回去網頁上
        res.end();
    }else if(req.url=="/todos" && req.method == "POST"){
        //接收body的資料
        req.on('end',()=>{
            //try是成功的時候要有的樣子 catch是防止壞掉的時候不能動外加給自己提示方便找錯誤
            try {
                //回來的東西要轉json變回物件才能取title因為原本是字串
                const title = JSON.parse(body).title;
                //title沒有值的時候是undefined 如果有值的時候才能傳
                if (title !== undefined) {
                    const todo = {
                        "title": title,
                        //ID是透過載入的UUID套件來隨機帶上
                        "id": uuidv4(),
                    }
                    //把得到的TODO塞進最上面自訂的TODO
                    todos.push(todo);
                    res.writeHead(200,headers);
                    //把塞進去以後的結果傳回網頁上
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos, 
                    }));
                    res.end();
                }else{
                    //title沒有值的時候會跳到這個
                    errorHandle(res);
                }
             //try歪掉的時候會跳來這個
            }catch(error){
                errorHandle(res);
            }
        })
    }else if(req.url=="/todos" && req.method == "DELETE"){
        //陣列的方法，總筆數=0直接全砍
        todos.length = 0;
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": [todos], 
        }));
        res.end();
        //URL上要帶有/todos/
    }else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
        //用'/'來切割結果會變成陣列 1/2/3 就會切成三筆  pop可以砍最後一筆然後返回那一筆的內容
        const id = req.url.split('/').pop();
        //findindex會找到第一筆符合的結果返回，返回的是"第幾筆"，如果沒有符合的就會減一，陣列的第一筆是0所以沒有會減一
        const index = todos.findIndex(element => element.id == id);
        if (index !== -1) {
            //刪除返回的那個筆數開始，然後從那邊開始1筆
            todos.splice(index, 1);
            res.writeHead(200,headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": [todos], 
            }));
            res.end();
        }else{
            errorHandle(res);
        }
    }else if(req.url.startsWith("/todos/") && req.method == "PATCH"){
        //同上方法找title跟ID然後覆蓋最上面自訂的那個TODOS
        req.on('end', ()=>{
            try{
                const todo = JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index = todos.findIndex(element => element.id == id);
                if (todo !== undefined && index !== -1) {
                    todos[index].title = todo;
                    res.writeHead(200,headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": [todos], 
                    }));
                    res.end();
                }else{
                    errorHandle(res);
                }
            }catch{
                errorHandle(res);
            }
        })
        //會修改到原本的資料的東西會觸發兩次請求驗證一下安全，這裡是第一次
    }else if(req.method == "OPTIONS") {
        res.writeHead(200,headers);
        res.end();
    }else{
        //400是客戶端錯誤  500是伺服器端
        res.writeHead(400,headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "沒有這個路由", 
        }));
        res.end();
    }
}

//開啟伺服器
const server = http.createServer(requestListener);

//3005是自己的，上了heroku以後以運行環境的為主
server.listen(process.env.PORT || 3005);

