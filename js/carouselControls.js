/*JQUERY SWIPEBOX FUNCTIONALITY*/
      ;(function($) {
         $('.swipebox').swipebox();
      }) (jQuery);

      var slideIndex = 1;

      function showDivs(n, slideshowid) {
         console.log(slideIndex);
         var i;
         var x = document.getElementsByClassName(slideshowid);
         if(n > x.length) { slideIndex = 1 }
         if(n < 1) {slideIndex = x.length}

         for(i = 0; i < x.length ; i++) {
            console.log(x);
            x[i].style.display = "none";
         }

         x[slideIndex-1].style.display = "flex";
      }

      function plusDivs(n, slideshowid) {
         showDivs(slideIndex += n, slideshowid);
      }