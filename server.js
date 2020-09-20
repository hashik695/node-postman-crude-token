var express=require("express")
var mysql=require("mysql")
var cors=require("cors")
var bodyParser=require("body-parser")
var jwt=require("jsonwebtoken")

var app=express()
app.use(cors())

var jsonParser=bodyParser.json()
var encodedParse=bodyParser.urlencoded({extended:false})

var con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"usertable"
})
con.connect((err,data)=>{
    if(err) throw err
    console.log("connected");
})

function verifyToken(req,res,next){
    let authHeader=req.headers.authorization
    if(authHeader==undefined){
       res.status(401).send({error:"no token provided"})
    }
    let token=authHeader.split(" ")[1]
    jwt.verify(token,"secret",(err,decode)=>{
        if(err){
            res.status(500).send({errore:"autheentication failed"})
        }else{
            next()
        }

    })
}


app.post("/login",jsonParser,(req,res)=>{
    if(req.body.username==undefined || req.body.password==undefined){
        res.status(500).send({error:"AUTHENTICATION FAILED"})
    }
    let username=req.body.username
    let password=req.body.password

    let qr= `select display_name from users where username='${username}' and password=sha1('${password}')`
    con.query(qr,(err,result)=>{
        if(err || result.length==0){
            res.status(500).send({error:"login failed"})
        }
        else{
            let resp={
                id:result[0].id,
                display_name:result[0].display_name
            }
            let token=jwt.sign(resp,"secret",{expiresIn
            :60})
            res.status(200).send({auth:true,token:token})
        }
    })

})

app.get("/book",verifyToken,(req,res)=>{
     var c=`select * from books`
     con.query(c,(err,result,field)=>{
         if(err)
         {
             throw err
         }else{
             res.send(result)
         }
     })
})

app.get("/book/:id",(req,res)=>{
    let id=req.params.id
    var d= `select * from books where id=${id}`
    con.query(d,(err,result,field)=>{
        if(err){
            throw err
        }
        res.send(result)
    })


  })
  
  app.post("/book",jsonParser,(req,res)=>{
      let book_title=req.body.book_title
      let description=req.body.description
      let book_author=req.body.book_author
      let price=req.body.price

      let qr=`insert into books(book_title,description,book_author,price) values('${book_title}','${description}','${book_author}',${700}) `

      con.query(qr,(err,result)=>{
          if(err)
          {
              res.send({error:"requsst fail"})
          }else{
              res.send({success:"req seccess"})
          }
      })




    
  })

  app.patch("/books",jsonParser,(req,res)=>{
    let book_title=req.body.book_title
    let description=req.body.description
    let book_author=req.body.book_author
    let price=req.body.price
    let id=req.body.id
    
    var qr=`update books set book_title='${book_title}',description='${description}',book_author='${book_author}',price='${price}' where id=${id}`

    con.query(qr,(err,result)=>{
        if(err){
            res.send({error:"failed"})
        }
        res.send({success:"sucess result"})
    })

  })

  app.delete("/book/:id",(req,res)=>{
      let id=req.params.id
      let qr=`delete  from books where id=${id}`
      con.query(qr,(err,result)=>{
          if(err){
              res.send({error:"failed"})

          }
          res.send({success:"sucesss"})
      })
  })



app.listen(3001,()=>{
    console.log("running");
})