function CSSAnimation(el, options) {
    this._handleMouse = function(e) {
        if (e.type === 'click') {
            var data = $.getLinkAction(e);
            switch (data.action) {
            case'Next':
                this.next();
                break;
            case'Prev':
                this.prev();
                break;
            case'Slide':
                var slide = data.link.data('slide');
                if (slide) {
                    this.animate($.toInt(slide));
                }
                break;
            }
        } else if (e.type === 'mouseenter') {
            this.pause();
        } else if (e.type === 'mouseleave') {
            this.play();
        }
    };
    this.play = function() {
        this._clear();
        this._paused = false;
        if (this._stopped) {
            return;
        }
        this._timer = setTimeout($.proxy(this.next, this), this.options.delay);
    };
    this.pause = function() {
        this._clear();
        this._paused = true;
    };
    this.stop = function() {
        this._stopped = true;
        this.pause();
    };
    this.start = function() {
        this._stopped = false;
        if (this._paused) {
            return;
        } else {
            this.play();
        }
    };
    this._clear = function() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    };
    this.next = function() {
        this.animate(this.index + 1);
    };
    this.prev = function() {
        this.animate(this.index - 1);
    };
    this.animate = function(index, instant) {
        index = $.toInt(index);
        if (index >= this.slides.length) {
            index = 0;
        } else if (index < 0) {
            index = this.slides.length - 1;
        }
        if (index === this.index) {
            return;
        }
        var reverse;
        if (index === 0 && this.index === this.slides.length - 1) {
            reverse = "";
        } else if (this.index === 0 && index === this.slides.length - 1) {
            reverse = " reverse";
        } else if (index < this.index) {
            reverse = " reverse";
        } else {
            reverse = "";
        }
        var slide1 = this.index < 0 ? this.slides.slice(0, 0): this.slides.eq(this.index);
        var slide2 = index < 0 ? this.slides.slice(0, 0): this.slides.eq(index);
        slide1.removeClass('transition-in slide-start slide-in reverse');
        slide2.removeClass('transition-out slide-in slide-end reverse').addClass('slide-start' + reverse);
        setTimeout(function() {
            if (instant) {
                slide1.addClass('slide-end' + reverse);
                slide2.addClass('slide-in');
            } else {
                slide1.addClass('transition-out').addClass('slide-end' + reverse);
                slide2.addClass('transition-in').addClass('slide-in');
            }
        }, 100);
        if ($.isFunction(this.options.onslide)) {
            this.options.onslide.apply(this, [this.index, index, this]);
        }
        if (this.navigation) {
            this.navigation.removeClass('active').eq(index).addClass('active');
        }
        this.index = index;
        if (!this._paused) {
            this.play();
        }
    };
    this.slides = el.find('.slide');
    this.options = $.extend({
        delay: $.toInt(el.data('delay')) || 8000
    }, options);
    this.slides.find("[data-src],[data-background-image]").each(function(i) {
        var item = $(this), src = item.data('src'), bg = item.data('background-image');
        if (src) {
            item.attr('src', src);
        }
        if (bg) {
            item.css({
                backgroundImage: 'url(' + bg + ')'
            });
        }
    });
    el.data('cssanimation', this);
    if (Modernizr.csstransitions && this.slides.length > 1) {
        this.element = el.on('click mouseenter mouseleave', $.proxy(this._handleMouse, this));
        if (this.options.nav) {
            this.navigation = $(this.options.nav);
            this.navigation.eq(0).addClass('active');
        }
        this.slides.slice(1).addClass('slide-end').show();
        if (this.options.start === 'play') {
            this.index =- 1;
            this.animate(0);
        } else {
            this.index = 0;
            this.slides.eq(0).addClass('slide-in').show();
            this.play();
        }
    } else if (Modernizr.csstransitions && this.options.start === 'play') {
        this.stop();
        this.index =- 1;
        this.animate(0);
    } else {
        this.slides.eq(0).addClass('slide-in').show();
        this.slides.slice(1).hide();
    }
}

