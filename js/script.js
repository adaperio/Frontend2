var isSplash = true;

$(document).ready(function(){
    var MSIE8 = (navigator.userAgent.toLowerCase().indexOf('msie 8')!=-1);

	$.fn.ajaxJSSwitch({
		topMargin:300,//mandatory property for desktop
		bottomMargin:240,//mandatory property for desktop
		topMarginMobileDevices:0,//mandatory property for mobile devices
		bottomMarginMobileDevices:0,//mandatory property for mobile devices
		menuInit:function (classMenu, classSubMenu){
			classMenu.find(">li").each(function(){
				/*$(">a", this).append("<div class='openPart'></div>");*/
			})
		},
		buttonOver:function (item){
			if(MSIE8){
				item.css({"color":"#fff"});
				$(".openPart", item).css({"visibility":"visible"});
			}else{
				item.stop(true).animate({"color":"#fff"}, 400, "easeOutCubic");
				$(".openPart", item).stop(true).animate({"opacity":"1"}, 400, "easeOutCubic");
			}
		},
		buttonOut:function (item){
			if(MSIE8){
				item.css({"color":"#aaa"});
				$(".openPart", item).css({"visibility":"hidden"});
			}else{
				item.stop(true).animate({"color":"#aaa"}, 400, "easeOutCubic");
				$(".openPart", item).stop(true).animate({"opacity":"0"}, 400, "easeOutCubic");
			}
		},
		subMenuButtonOver:function (item){ 
		      item.stop().animate({"color":"#fff"}, 300, "easeOutCubic");
        },
		subMenuButtonOut:function (item){
		      item.stop().animate({"color":"#898787"}, 300, "easeOutCubic");
        },
		subMenuShow:function(subMenu){
            if(MSIE8){
				subMenu.css({"display":"block"});
			}else{
				subMenu.stop(true).css({"display":"block"}).animate({"opacity":"1"}, 400, "easeOutCubic");
			}
        },
		subMenuHide:function(subMenu){
            if(MSIE8){
				subMenu.css({"display":"none"});
			}else{
				subMenu.stop(true).delay(300).animate({"opacity":"0"}, 400, "easeOutCubic", function(){
					$(this).css({"display":"none"})
				});
      
			}
        },
		pageInit:function (pages){
		},
		currPageAnimate:function (page){
              page.css({left:'-1500px'}).stop(true).delay(0).animate({left:0}, 500, "easeInOutExpo");
              isSplash = false;
              //console.log (isSplash)
              //$("header").stop(true).animate({"top":90}, 500, "easeOutCubic");
              $(window).trigger('resize');   
        },
		prevPageAnimate:function (page){
              page.stop(true).animate({left:'1500px'}, 500, "easeInSine");
              $("#wrapper>section>#content_part, #topPart").css({"visibility":"visible"}).stop(true).animate({"top":0}, 700, "easeInOutCubic");
      
        },
		backToSplash:function (){
		      isSplash = true;
              $("#wrapper>section>#content_part, #topPart").stop(true).delay(0).animate({"top":$(window).height()+20}, 700, "easeInOutCubic", function(){$(this).css({"visibility":"hidden"})});
              $(window).trigger('resize');        
        },
		pageLoadComplete:function (){
		}
	});
})

$(window).load(function(){	
	$("#webSiteLoader").delay(50).animate({opacity:0}, 500, "easeInCubic", function(){
        $("#webSiteLoader").remove()}
    );

	$('#prev_arr, #next_arr')
	.sprites({
		method:'simple',
		duration:400,
		easing:'easeOutQuint',
		hover:true
	})

	//$('.social_icons > li').hoverSprite({onLoadWebSite:true});

//-----Window resize------------------------------------------------------------------------------------------
	$(window).resize(
        function(){
            resize_function();
        }
    ).trigger('resize');

	function resize_function(){
	    var h_cont = $('header').height();
	    var wh = $(window).height();
		m_top = ~~(wh-h_cont)/2-100;

        if(isSplash){
            $("header").stop(true).delay(300).animate({"top":m_top}, 350, "easeOutSine");
            /*$("footer").stop(true).animate({"height":88}, 350, "easeOutSine");*/
        }else{
            $("header").stop(true).animate({"top":10}, 500, "easeOutCubic");
        }
    }

    $(document).resize(
        function(){}
    ).trigger('resize');

	//bgStretch ---------------------------------------------------------------------------------------------
    /*
    $('#bgStretch')
		.bgStretch({
			align:'rightTop',
			navigs:$('#bgNav').navigs({autoPlay:12000, prevBtn:$('#prev_arr'), nextBtn:$('#next_arr')})
		}).sImg({

		});
    */

    /*
    $("body").bgStretcher({
        images: ["img/bg_pic4.jpg", "img/bg_pic2.jpg","img/bg_pic3.jpg","img/bg_pic1.jpg"],
        imageWidth: 1600,
        imageHeight: 977
    });
    */

    // input button logics goes here:
    function allFilled() {
        var filled = true;

        $('#num_input').each(function() {
            if($(this).val() == '') filled = false;
        });

        return filled;
    }

    function convertToCyr(ch){
        var c =
            [
                {f:'a',
                    t:'а'},

                {f:'b',
                    t:'в'},

                {f:'e',
                    t:'е'},

                {f:'k',
                    t:'к'},

                {f:'m',
                    t:'м'},

                {f:'h',
                    t:'н'},

                {f:'o',
                    t:'о'},

                {f:'p',
                    t:'р'},

                {f:'c',
                    t:'с'},

                {f:'t',
                    t:'т'},

                {f:'y',
                    t:'у'},

                {f:'x',
                    t:'х'}
            ];

        for(var i=0; i< c.length; ++i){
            if(ch===c[i].f){
                console.log('-->Convert ' + ch + ' to ' + c[i].t);
                return c[i].t;
            }
        }
        return ch;
    }

    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    function startSearch() {
        var num    = document.getElementById("num_input").value;
        var region = document.getElementById("region_input").value;

        var numConcat = num + region;
        numConcat = numConcat.replace(/\s+/g, '');

        var len = numConcat.length;
        if(!len){
            return;
        }

        if(len<=2){
            // TODO: animation
            return window.alert('Введен неверный номер автомобиля!');
        }

        if(!isNumber(numConcat[len-1]) || !isNumber(numConcat[len-2])){
            // TODO: animation
            return window.alert('Неверный регион!');
        }
        numConcat = numConcat.toLowerCase();

        // convert all latin symbols to cyr
        var numConcatAfter = '';
        for(var i=0; i<len; ++i){
            numConcatAfter = numConcatAfter + convertToCyr(numConcat[i]);
        }

        numConcat = numConcatAfter;

        if(numConcat.length){
            location.href = '/engine.html#/search/' + numConcat;
        }
    }

    function updateYandexMetrika(){
        try {
            if(typeof(window.yandexGoal1Triggered)==='undefined'){
                window.yaCounter24002680.reachGoal('NUMBER_ENTERED');
                window.yandexGoal1Triggered = true;
            }

        } catch(e) {
            console.log('-->Goal error...' + e);
        }
    }

    // inputs:
    // initial state (that is used when user does 'back' in browser
    $('#search_button').attr('disabled',!allFilled());

    $("#num_input").on('keyup',function(e) {
        $('#search_button').attr('disabled',!allFilled());

        updateYandexMetrika();

        if (e.which == 13) {
            startSearch();
        }
    });

    $("#region_input").on('keyup',function(e){
        updateYandexMetrika();

        if (e.which == 13) {
            startSearch();
        }
    });

    document.getElementById("search_button").onclick = function(){
        startSearch();
    };

    document.getElementById("a_samples").onclick = function(event){
        event.preventDefault();
        location.href = 'engine.html#/success?InvId=17728031';
    };

    document.getElementById("a_sample1").onclick = function(event){
        event.preventDefault();
        location.href = 'engine.html#/success?InvId=17728031';
    };

    document.getElementById("a_sample2").onclick = function(event){
        event.preventDefault();
        location.href = 'engine.html#/success?InvId=549532454';
    };

    document.getElementById("a_sample3").onclick = function(event){
        event.preventDefault();
        location.href = 'engine.html#/success?InvId=78732006';
    };

    $("#num_input").focus();
});

 
