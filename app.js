const express = require('express');
const mongoose = require("mongoose")
const date =  require(__dirname + "/date.js");
const ejs = require('ejs');

const app = express()
const port = 3000


console.log(process.env.MONGODB_TODOLIST)


// APP USES
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(__dirname + '/public'));


// DATABASE SETUP
mongoose.connect(process.env.MONGODB_TODOLIST, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema ({
    name: String
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})


const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);


// INITIALIZE TASK LISTS



    
const item1 = new Item ({
    name: "Create a task using form below"
});

const item2 = new Item ({
    name: "Check when done"
});
    
const defaultItems = [item1, item2]






// DATE AND NAME OF LIST
let nameOfDay = date.getDate();
console.log(nameOfDay)

if (date.isWeekend()) {
    var day = "weekend";
} else {
    var day = "weekday, damn it";
};


// HOME ROUTES
app.get('/favicon.ico', (req, res) => res.status(204));
app.get('/', function (req, res) {
    Item.find({}, function(err, foundItems) {
        if (err) {
            console.log(err)
        } else {
            console.log(foundItems)
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems, function(err){
                    if (!err) {
                        console.log(defaultItems);
                    }
                })
  
                res.redirect("/");
            };
            
            res.render("list", {listTitle: day, nameOfDay: nameOfDay, items: foundItems, route:"/"});
        }
    })
});

app.post("/", function (req, res) {
    
    const newItem = new Item ({
        name: req.body.newItem
    });
    
    
    newItem.save();
    
    res.redirect("/");
});

// ITEM ACTIONS

app.post('/delete', function(req, res) {
    console.log(req.body.checkOrigin)
    if (req.body.checkOrigin === "/") {

        List.findOne( { "items._id": req.body.checkbox }, function(err, found) {

            if (found) {
                List.findOneAndUpdate( {name: found.name},
                { $pull: {items:{_id: [req.body.checkbox] }} }, function(err, foundList) {
                    if (!err) {
                        Item.deleteOne({_id: req.body.checkbox}, function(err){
                            if (!err) {console.log("Did it")}
                        })
                    }
                })
            };
        })
        Item.deleteOne({_id: req.body.checkbox}, function(err){
            if (err) {
                console.log(err)
            } else {
                console.log("Success with deleting")
            };
        });

        res.redirect(req.body.checkOrigin);

    } else {
        List.findOneAndUpdate( {name: req.body.listTitle},
            { $pull: {items:{_id: [req.body.checkbox] }} }, function(err, foundList) {
                if (!err) {
                    Item.deleteOne({_id: req.body.checkbox}, function(err){
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("Success with deleting")
                        };
                    });
                    res.redirect(req.body.checkOrigin);

                }
            } );
        
    }

    
});

// WORK REQUESTS
app.get("/:listName", function(req,res) {

    const listName = req.params.listName.toLowerCase();

    List.findOne({name:listName}, function(err, foundList) {
        if (err) {
            console.log(err)
        } else {
            
            if (!foundList) {
                console.log(`There is no list ${listName}, I am creating new one`)
                const list = new List({
                    name: listName,
                    items: defaultItems
                })

                list.save()

                res.redirect(`/${listName}`);
            } else {
                console.log(foundList.items)
                res.render("list", {listTitle:listName, 
                                    nameOfDay: nameOfDay, items: foundList.items, route:`/${listName}`})
            }

        }
    })

});

app.post("/:listName", function (req, res) {

    const listName = req.params.listName.toLowerCase();

    const newItem = new Item ({
        name: req.body.newItem
    });

    newItem.save();
    
    List.findOneAndUpdate({name:listName},
        { $push: { items: newItem } },
        function(err, foundList) {
        if (!err) {
            // foundList.items.push(newItem);
            // foundList.save();
            console.log(newItem);
            res.redirect(`/${listName}`);
        }
    });

});


// ABOUT
app.get("/about", function(req,res) {
    res.render("about");
});




// LISTEN
app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});