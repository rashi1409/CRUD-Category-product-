var express = require('express');
var router = express.Router();
const path = require('path');
const db = require('./dbconfig');
const mongoose = require('mongoose');
/* GET admin listing. */
router.use((request,response,next)=>{
   request.session.current_user ? next() : response.redirect('/login');
});
router.get('/', function(request, response) {
  response.render('admin_dashboard',{currentUser: request.session.current_user});
});
router.get('/add-category',(request,response)=>{
   response.render('add-category',{currentUser: request.session.current_user});
});
router.post('/add-category',(request,response)=>{
   let cid = new Date().getTime();
   request.body.category_id = ''+cid;
   db.collection('category').insert(request.body,(err,result)=>{
      err ? response.render('error') : response.redirect('/admin/add-category');
   });
});
router.get('/category-list',(request,response)=>{
   db.collection('category').find().toArray((err,results)=>{
      if(!err)
       response.render('category-list',{categoryList: results,currentUser: request.session.current_user})
   })
})
router.get('/edit-category/:id',(request,response)=>{
   db.collection('category').find({_id: new mongoose.Types.ObjectId(''+request.params.id)}).toArray((err,result)=>{
      if(!err)
      console.log(result)
      response.render('edit-category',{currentUser: request.session.current_user,category:result})
   })
})
router.post('/edit-category',(request,response)=>{
   let id = request.body.id
   db.collection('category').update({
      _id: new mongoose.Types.ObjectId(''+id)
   },{
      $set: request.body
   },(err)=>{
      err ? response.render('error') : response.redirect('/admin/category-list');
   });
})
router.get('/delete-category/:id',(request,response)=>{
   db.collection('category').remove({_id: new mongoose.Types.ObjectId(''+request.params.id)},(err)=>{
      
      !err ? response.redirect('/admin/category-list'):response.render('error');
    });
})
router.get('/add-product',(request,response)=>{
   db.collection('category').find({}).toArray((err,results)=>{
     if(!err)
       response.render('add-product',{categoryList: results,currentUser: request.session.current_user});
   });
});
router.post('/add-product',(request,response)=>{
  console.log(request.body);
  let file = request.files.product_image;
  let fileName = new Date().getTime()+file.name;
  let filePath = path.join(__dirname,'../public/images',fileName);
  file.mv(filePath,(err)=>{
    if(!err){
      request.body.image = fileName;
      db.collection('product').insert(request.body,(err)=>{
         err ? response.render('error') : response.redirect('/admin/add-product');
      });
    }
    
  })
});
router.get('/product-list',(request,response)=>{
   db.collection('product').aggregate([{
      $lookup:{
         from: 'category',
         foreignField: 'category_id',
         localField: 'cat_id',
         as: 'category'
      }
   }]).toArray((err,results)=>{
      err ? console.log(err) : response.render('product-list',{currentUser: request.session.current_user,productList: results});
   })
});
router.get('/update-product/:id',(request,response)=>{
   let categoryList = new Promise((resolve,reject)=>{
      db.collection('category').find({}).toArray((err,results)=>{
         err ? reject(err) : resolve(results);
      })
   });
   let product = new Promise((resolve,reject)=>{
     db.collection('product').find({_id: new mongoose.Types.ObjectId(''+request.params.id)}).toArray((err,result)=>{
        err ? reject(err) : resolve(result);
     });
   });
   Promise.all([categoryList,product]).then((results)=>{
       response.render('update-product',{currentUser: request.session.current_user,product: results[1][0],categoryList: results[0]});
   }).catch((err)=>{
      console.log(err);
   });
});
router.post('/update-product',(request,response)=>{
   // {id:110,name:.......};
   let id = request.body.id;

   // {name:........}
   delete request.body.id;
   if(request.files){
      let file = request.files.product_image;;
      let fileName = new Date().getTime()+file.name;
      let filePath = path.join(__dirname,'../public/images',fileName);
      file.mv(filePath,err=>{
        if(!err){
            request.body.image = fileName;
            db.collection('product').update({
               _id: new mongoose.Types.ObjectId(''+id)
            },{
               $set:request.body
            },(err)=>{
               err ? response.render('error') : response.redirect('/admin/product-list');
            });
        } 
      });
    }
    else{
      db.collection('product').update({
         _id: new mongoose.Types.ObjectId(''+id)
      },{
         $set: request.body
      },(err)=>{
         err ? response.render('error') : response.redirect('/admin/product-list');
      });
    }
 });
 router.get('/delete-product/:id',(request,response)=>{
    db.collection('product').remove({_id: new mongoose.Types.ObjectId(''+request.params.id)},(err)=>{
      
      !err ? response.redirect('/admin/product-list'):response.render('error');
    });
 });
 router.get('/logout',(request,response)=>{
   request.session.current_user = '';
   request.session.destroy();
   response.redirect('/login');
 });
module.exports = router;












