"use strict";

class Product
{
    constructor()
    {
        this.canvas = $("canvas").get(0);
        this.ctx = this.canvas.getContext("2d");
        this.h = 400;
        this.w = 400;
        this.svg = null;
        this.ns = "http://www.w3.org/2000/svg";
        this._title = $(document).find("title").text();
    }
    
    test() 
    {
        alert("Product.class"); 
    }
    
    clsCanvas()
    {
        this.ctx.clearRect(0, 0, this.h, this.w);
    }
    
    clsInput()
    {
        let s = $("input.comp:text").toArray();
        s.forEach((i)=> i.value = "");
    }
    
    clsSelect()
    {
        let s = $("select.comp option[value='N']").toArray();
        s.forEach(()=> $(s).prop("selected",true));
    }
    
    setBackgroundImage(itemClass, img)
    {
        var tmp  = "images/".concat(img);
        $(".".concat(itemClass)).css("background-image","url(".concat(tmp).concat(".png)"));
        $(".".concat(itemClass)).css("background-repeat","no-repeat");
        $(".".concat(itemClass)).css("background-position","center center");
    }
    
    loadSvg()
    {
        var a= {param:this._title.toUpperCase()}; 
        var list = JSON.parse(JSON.stringify(a));
        $.ajax
        ({
            type: "GET",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            url: "/factoryTest".concat("?schema=".concat(this._title.toUpperCase())),
            data: list,
            async:false,
            beforeSend:()=>
            {
                console.log("start request");
            },
            success:(msg,status)=>
            {
                console.log("response: " + msg);
                var parser = new DOMParser();
                this.svg = parser.parseFromString(msg,"image/svg+xml");
            },
            error:(xhr, ajaxOptions, thrownError)=> 
            {
                console.log(xhr.status + "\n" + thrownError);
            },
            complete:(d)=>
            {
                console.log("completed");
            }
        }); 
    }

    textFactory(svgDoc, inputName, selectEndOne)
    {
        try 
        {
           //suffix map
            var SUFFIX = {N:61,"B":60123,"C":60062,"F":60040,"H":60091};
            const x = 60000;
            
            var regex = /[\(\)\[\]:;#@\^\|\?\",<>\!\\_=\+\*~`\.\{\}']/g;

            inputName = inputName.split(" ").join("");
            inputName = inputName.replace(regex, "");
            
            //map prefix, body, suffix
            let _a, _b, _c, _d;

            if(inputName.substring(0,1).match(/^[\&|\-]/g))
            {
                return;
            }
            else
            {
                _a = String.fromCharCode(inputName.substring(0,1).charCodeAt(0) + x);
            }

            _b = "";
            if(inputName.length > 1)
            {
                _b = inputName.substring(1,inputName.length);
            }
            
            _c = String.fromCharCode(SUFFIX[selectEndOne]);
            

            var _target = svgDoc.getElementById("txt1");
            _target.textContent = "";
            
            var _prefix ,_body, _suffix;
            _prefix = document.createElementNS(this.ns,"tspan");
            _body = document.createElementNS(this.ns,"tspan");
            _suffix = document.createElementNS(this.ns,"tspan"); 
           
           _prefix.textContent = _a;
           _body.textContent = _b;
           _suffix.textContent = _c;
           
            svgDoc.getElementById("txt1").appendChild(_prefix);
            svgDoc.getElementById("txt1").appendChild(_body);
            svgDoc.getElementById("txt1").appendChild(_suffix);
        } 
        catch (e) 
        {
            alert("textFactory: " + e);
        }
    }
    
    drawSvg(svgDoc)
    {
        try 
        {
            var serializer = new XMLSerializer();
            var svgString = serializer.serializeToString(svgDoc);
            console.log(svgString);
            var img = new Image();
            img.src = "data:image/svg+xml,".concat(encodeURIComponent(svgString));

            img.onload = ()=> 
            {
                this.clsCanvas();
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            };
        } 
        catch(e) 
        {
            alert("drawSvg: "+e);
        }
    }
    
    resetCanvas()
    {
        if($("#txtOne").val() === "")
        {
            console.log("empty");
            this.clsCanvas();
        }
    }
    
    render()
    {  
        $(document)
            .on("keyup","#txtOne",(evt)=>
            {
                try 
                {
                    if(evt.keyCode === 18 )
                    {
                        this.resetCanvas();//$("#txtMotif").find(":selected").val();//console.log(evt.keyCode);//alert(evt.keyCode );
                    }
                    this.resetCanvas();
                    //update text
                    this.textFactory(this.svg, $("#txtOne").val(), $("#txtMotif").find(":selected").val());
                    //paint canvas
                    this.drawSvg(this.svg);
                } 
                catch (e) 
                {
                    alert("render: "+e);
                }
            })
            .bind("change","#txtMotif",(evt)=> 
            {
                try 
                {
                    if(evt.keyCode === 18 )
                    {
                        evt.altCode ;//$("#txtMotif").find(":selected").val();//console.log(evt.keyCode);//alert(evt.keyCode );
                    }
                    this.resetCanvas();
                    //update text
                    this.textFactory(this.svg, $("#txtOne").val(), $("#txtMotif").find(":selected").val());
                    //paint canvas
                    this.drawSvg(this.svg);
                } 
                catch (e) 
                {
                    alert("txtMotif: "+e);
                }
            });
    }
    
    shareImage()
    {
        $(document).on("click","#btnEmail",()=>
        {
            try 
            {
                var dataUrl = this.canvas.toDataURL();
                var a = {imag:dataUrl,param:$("#productStyle").html()};

                $.ajax
                ({
                    type: "POST",
                    contentType: "application/x-www-form-urlencoded; charset=utf-8",
                    url: "/shareImage",
                    data: a,
                    beforeSend:()=>
                    {
                        console.log("start sending image");
                    },
                    success:(msg,status)=>
                    {
                        console.log(msg);
                    },
                    error:(xhr, ajaxOptions, thrownError)=> 
                    {
                        console.log(xhr.status + "\n" + thrownError);
                    },
                    complete:(d)=>
                    {
                        console.log(d);
                    }
                });
            } 
            catch (e) 
            {
                alert(e);
            }
        });
    }
    
    init()
    {
        //this.loadSvg();
        //this.render();
        //this.shareImage();
        this.test();
    }
}
