include('request_url.js');
//----jquery-plugins----
include('jquery-1.11.0.min.js');
include('jquery.ba-resize.min.js');
include('jquery.easing.1.3.js');
include('jquery.animate-colors-min.js');
include('jquery.backgroundpos.min.js');
include('jquery.mousewheel.js');
include('jquery.fancybox.pack.js');
//----All-Scripts----
/*include('jquery.mobilemenu.js');*/

//include('bgStretch.js');
//include('jquery-bgstretcher-3.3.0.min.js');

include('forms.js');
include('sImg.js');
include('uScroll.js');
include('hoverSprite.js');
include('sprites.js');
include('scroll_to_top.js');
include('ajax.js.switch.js');
include('script.js');
//----Include-Function----
function include(url){ 
  document.write('<script type="text/javascript" src="js/'+ url + '"></script>'); 
  return false ;
}
