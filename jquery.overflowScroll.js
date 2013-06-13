;(function (window, $, _) {
    "use strict";

    $.fn.overflowScroll = function () {
        this.each(function (i) {
            setup($(this));
        });
    };

    function setup($target) {
        var isTouch = false,
            blockingClick = false,
            intervalID,
        //
            touchStartX = 0,
            touchStartY = 0,
            scrollStartX = 0,
            scrollStartY = 0,
        //
            touchX = 0,
            touchY = 0,
            touchSpeedX = 0,
            touchSpeedY = 0,
        //
            minScrollX = 0,
            minScrollY = 0,
            maxScrollX = ($target.get(0).scrollWidth || $target.get(0).clientWidth) - $target.width(),
            maxScrollY = ($target.get(0).scrollHeight || $target.get(0).clientHeight) - $target.height();

        function clickSilencer() {
            return !blockingClick;
        }
        $target.on("click", "a", clickSilencer);
        $target.on("touchstart", function (event) {
            event = event.originalEvent;
            event.preventDefault();

            blockingClick = false;
            clearInterval(intervalID);

            isTouch = true;

            var touch = event.touches[0];

            touchStartX = touchX = touch.pageX;
            touchStartY = touchY = touch.pageY;

            scrollStartX = $target.scrollLeft();
            scrollStartY = $target.scrollTop();
        });
        $target.on("touchmove", _.throttle(function (event) {
            if(!isTouch) { return; }

            event = event.originalEvent;
            var touch = event.touches[0];

            touchX = touch.pageX;
            touchY = touch.pageY;

            var diffX = Math.abs(touchStartX - touchX),
                diffY = Math.abs(touchStartY - touchY);

            if(!blockingClick && (diffX > 20 || diffY > 20)) {
                blockingClick = true;
            }
            var willScrollX = scrollStartX + (touchStartX - touchX),
                willScrollY = scrollStartY + (touchStartY - touchY);

            $target.scrollLeft(willScrollX);
            $target.scrollTop(willScrollY);

        }, 100));
        $target.on("touchend touchcancel", function (event) {
            event = event.originalEvent;

            var touch = event.changedTouches[0];
            isTouch = false;

            touchSpeedX = (touchX - touch.pageX);
            touchSpeedY = (touchY - touch.pageY);

            touchX = touch.pageX;
            touchY = touch.pageY;

            var willScrollX = scrollStartX + (touchStartX - touchX),
                willScrollY = scrollStartY + (touchStartY - touchY),
                oldScrollX = $target.scrollLeft(),
                oldScrollY = $target.scrollTop();

            if(oldScrollX > minScrollX && oldScrollX <  maxScrollX) {
                $target.scrollLeft(willScrollX);
            } else {
                touchSpeedX = 0;
            }

            if(oldScrollY > minScrollY && oldScrollY < maxScrollY) {
                $target.scrollTop(willScrollY);
            } else {
                touchSpeedY = 0;
            }

            intervalID = setInterval(afterMoving, 16);
        });

        function afterMoving() {
            if (isTouch) {
                clearInterval(intervalID);
                return;
            }
            if ((Math.abs(touchSpeedX)<0.5 && Math.abs(touchSpeedY)<0.5)) {
                blockingClick = false;
                clearInterval(intervalID);
                return;
            }

            var oldX = $target.scrollLeft(),
                oldY = $target.scrollTop(),
                FRICTION = 0.98,
                LIMIT_SPEED = 10;

            touchSpeedX *= FRICTION;
            touchSpeedY *= FRICTION;

            $target.scrollLeft(oldX + Math.round(Math.min(LIMIT_SPEED,Math.max(-LIMIT_SPEED, touchSpeedX))));
            $target.scrollTop(oldY + Math.round(Math.min(LIMIT_SPEED,Math.max(-LIMIT_SPEED, touchSpeedY))));
        }
    }
})(this, jQuery, _);
