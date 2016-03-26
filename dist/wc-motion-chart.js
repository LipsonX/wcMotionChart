/*
 * Author: LipsonChan <Lipson@loveskitehcn.com>
 * License: MIT
 */

(function ($) {
    function WcChart(config) {
        this.init(config);
    }

    WcChart.prototype = {
        /**
         * margin of chart
         */
        margin: 20,

        /**
         * Initial width
         * @type {number}
         */
        width: 0,

        /**
         * Initial height
         * @type {number}
         */
        height: 0,

        /**
         * Is data has loaded
         * @type {false}
         */
        isDataLoad: false,

        /**
         * Initial of chart data
         * @type {Array}
         */
        data: null,

        /**
         * data format, it will be init by init function
         * @type {Array}
         */
        points: [],

        /**
         * font family
         * @type {String}
         */
        fontFamily: 'sans-serif,arial',

        /**
         * Initial end day
         * @type {Date}
         */
        day: null,

        /**
         * Initial of chart y-axis limit
         * @type {number}
         */
        yAxis: 16000,

        /**
         * Initial of chart y-axis increase unit
         * @type {number}
         */
        yAxisIc: 4000,

        /**
         * Background quad angle radius
         * @type {number}
         */
        quadRadius: 30,

        /**
         * head left text
         * @type {String}
         */
        headText: "步数",

        /**
         * chart font size
         * @type {Number}
         */
        chartFontSize: 30,

        /**
         * 10 thousand y-axis height
         * @type {Number}
         */
        chartMeanLine : 0,

        /**
         * rank reference, a json object
         * - null: means never mind it
         * - normal json data
         *   - { height: 30, avatar: Image, title : 'xxx get first', url: 'http://'}
         * @type {Object}
         */
        rankRef: null,
        rankPadding: 5,
        rankImgPattern: null,

        /**
         * rectangles
         * - {x: 0, y: 0, width: 0, height: 0}
         * @type {Object}
         */
        rectHead: {x: 0, y: 0, width: 0, height: 0},
        rectChart: {x: 0, y: 0, width: 0, height: 0},
        rectChartCenter: {x: 0, y: 0, width: 0, height: 0},
        rectRank: {x: 0, y: 0, width: 0, height: 0},
        rectRankAvatar: {x: 0, y: 0, width: 0, height: 0},
        rectRankBtn: {x: 0, y: 0, width: 0, height: 0},
        rectRankText: {x: 0, y: 0, width: 0, height: 0},

        /**
         * This is the only required option. It should be from 0.0 to 1.0
         * @type {number}
         */
        value: 1,

        /**
         * Fill of the arc. You may set it to:
         *   - solid color:
         *     - { color: '#3aeabb' }
         *     - { color: 'rgba(255, 255, 255, .3)' }
         *   - linear gradient (left to right):
         *     - { gradient: ['#3aeabb', '#fdd250'], gradientAngle: Math.PI / 4 }
         *     - { gradient: ['red', 'green', 'blue'], gradientDirection: [x0, y0, x1, y1] }
         *   - image:
         *     - { image: 'http://i.imgur.com/pT0i89v.png' }
         *     - { image: imageObject }
         *     - { color: 'lime', image: 'http://i.imgur.com/pT0i89v.png' } - color displayed until the image is loaded
         */
        fill: {
            gradient: ['#3aeabb', '#fdd250']
        },

        /**
         * Animation config (see jQuery animations: http://api.jquery.com/animate/)
         */
        animation: {
            duration: 400,
            easing: 'wcChart'
        },

        /**
         * Default animation starts at 0.0 and ends at specified `value`. Let's call this direct animation.
         * If you want to make reversed animation then you should set `animationStartValue` to 1.0.
         * Also you may specify any other value from 0.0 to 1.0
         * @type {number}
         */
        animationStartValue: 0.0,

        /**
         * @type {number}
         */
        animationPoint: null,

        /**
         * Constructor of wechat chart
         */
        constructor: WcChart,

        /**
         * Container element. Should be passed into constructor config
         * @type {jQuery}
         */
        el: null,

        /**
         * Canvas element.
         * @type {HTMLCanvasElement}
         */
        canvas: null,

        /**
         * 2D-context of the canvas
         * @protected
         * @type {CanvasRenderingContext2D}
         */
        ctx: null,

        /**
         * Fill of the background
         * @type {string|CanvasGradient|CanvasPattern}
         */
        fillPattern: null,

        /**
         * Last rendered frame value
         * @type {number}
         */
        lastFrameValue: 0.0,

        /**
         * Init/re-init the widget
         * @param {object} config Config
         */
        init: function (config) {
            $.extend(this, config);
            if (config.data) {
                this.isDataLoad = true;
            }

            this.initWidget();
            this.initRect();
            this.initData();
            this.initRank();
            this.initFill();
            this.draw();

            this.el.click(this.clickFuc);
        },

        /**
         * Init widget
         * @protected
         */
        initWidget: function () {
            var jEl = $(this.el),
                canvas = this.canvas = this.canvas || jEl[0];
            canvas.width = this.width = this.width == 0 ? jEl.width() : this.width;
            canvas.height = this.height = this.height == 0 ? jEl.height() : this.height;
            this.ctx = canvas.getContext('2d');
        },

        /**
         * Init rectangles
         */
        initRect: function () {
            var margin = this.margin;
            var titleHeight = 108;
            var rankHeight = 0;
            if (this.rankRef) {
                rankHeight = this.rankRef.height;
            }

            this.rectHead = {x: margin, y: 0, width: this.width - 2 * margin, height: titleHeight};

            this.rectChart = {
                x: margin, y: titleHeight,
                width: this.width - 2 * margin,
                height: this.height - titleHeight - rankHeight
            };

            this.rectChartCenter = {
                x: this.rectChart.x,
                y: this.rectChart.y + this.chartFontSize * 2.5,
                width: this.rectChart.width - this.chartFontSize * 0.8,
                height: this.rectChart.height - this.chartFontSize * 5,
            };

            this.rectRank = {
                x: margin, y: this.height - rankHeight,
                width: this.width - 2 * margin,
                height: rankHeight
            };

            this.rectRankAvatar = {
                x: this.rectRank.x,
                y: this.rectRank.y,
                width: this.rectRank.height,
                height: this.rectRank.height
            };

            this.rectRankBtn = {
                x: this.rectRank.width - this.rectRank.height,
                y: this.rectRank.y,
                width: this.rectRank.height,
                height: this.rectRank.height
            };

            this.rectRankText = {
                x: this.rectRankAvatar.x + this.rectRankAvatar.width,
                y: this.rectRank.y,
                width: this.rectRank.width - 2 * this.rectRank.height,
                height: this.rectRank.height
            };
        },

        /**
         * init all data
         */
        initData: function () {
            if (!$.isArray(this.data) || this.isDataLoad == false) {
                this.data = [0, 0, 0, 0, 0, 0];
            }

            if (this.day == null) {
                this.day = new Date();
            }

            /* get limit and last data */
            var maxData = Math.max.apply(Math, this.data),
                interval = this.rectChartCenter.width / (this.data.length - 1),
                itrDay = new Date(),
                yMaxUint = maxData <= this.yAxis ? this.yAxis :
                    Math.ceil((maxData - this.yAxis) / this.yAxisIc) * this.yAxisIc + this.yAxis;

            /* init begin date and prepare for iteration */
            itrDay.setDate(this.day.getDate() - this.data.length + 1);

            /* find out y-axis point of 10 thousand unit line */
            this.chartMeanLine = this.rectChartCenter.y + this.rectChartCenter.height
                - 10000 * this.rectChartCenter.height / yMaxUint;

            /* transfer data into points */
            for (var i = 0; i < this.data.length; i++) {
                this.points[i] = {
                    x: this.rectChartCenter.x + interval * i,
                    y: this.rectChartCenter.y + this.rectChartCenter.height
                        - this.data[i] * this.rectChartCenter.height / yMaxUint,
                    value: this.data[i],
                    text: i == 0 ? (itrDay.getMonth() + 1) + "月" + itrDay.getDate() : itrDay.getDate(),
                    radius: i == this.data.length - 1 ? 9 : 6,
                    textAlign: i == 0 ? 'left' : 'center',
                    rect: {x: this.rectChartCenter.x + interval * (i - 0.5), y: this.rectChart.y,
                        width: interval, height: this.rectChart.height}
                };

                itrDay.setDate(itrDay.getDate() + 1);
            }
        },

        /**
         * init rank params
         */
        initRank: function () {
            if (this.rankRef == null) {
                return;
            }

            if (this.rankRef.avatar) {
                var img = this.rankRef.avatar;
                img.height = this.rankRef.height - this.rankPadding * 2;
                img.width = img.height;
                this.rankImgPattern = this.ctx.createPattern(this.rankRef.avatar, 'no-repeat');

                /* redraw when image load in same case */
                var instance = this;
                this.rankRef.avatar.onload = function() {
                    instance.draw();
                }
            }
        },

        /**
         * Init fill pattern
         * It could do this async (on image load)
         */
        initFill: function () {
            var self = this,
                fill = this.fill,
                ctx = this.ctx,
                width = this.width,
                height = this.height;

            if (!fill)
                throw Error("The fill is not specified!");

            if (fill.color)
                this.fillPattern = fill.color;

            if (fill.gradient) {
                var gr = fill.gradient;

                if (gr.length == 1) {
                    this.fillPattern = gr[0];
                } else if (gr.length > 1) {
                    var ga = fill.gradientAngle || 0, // gradient direction angle; 0 by default
                        gd = fill.gradientDirection || [
                                width / 2 * (1 - Math.cos(ga)), // x0
                                height / 2 * (1 + Math.sin(ga)), // y0
                                width / 2 * (1 + Math.cos(ga)), // x1
                                height / 2 * (1 - Math.sin(ga))  // y1
                            ];

                    var lg = ctx.createLinearGradient.apply(ctx, gd);

                    for (var i = 0; i < gr.length; i++) {
                        var color = gr[i],
                            pos = i / (gr.length - 1);

                        if ($.isArray(color)) {
                            pos = color[1];
                            color = color[0];
                        }

                        lg.addColorStop(pos, color);
                    }

                    this.fillPattern = lg;
                }
            }
        },

        draw: function () {
            if (this.animation)
                this.drawAnimated(this.value);
            else
                this.drawFrame(this.value);
        },

        /**
         * draw a frame
         * @param {number} v Frame value
         */
        drawFrame: function (v) {
            this.lastFrameValue = v;
            //this.ctx.clearRect(0, 0, this.width, this.height);

            this.ctx.fillStyle = "white";
            this.ctx.strokeStyle="white";

            this.drawBack();
            this.drawHead();
            this.drawChart();
            this.drawStep(v);
            this.drawRank();
        },

        /**
         * draw background
         */
        drawBack: function () {
            var ctx = this.ctx;
            ctx.save();
            ctx.fillStyle = this.fillPattern;
            ctx.globalAlpha = 1;
            ctx.roundRect(0, 0, this.width, this.height, this.quadRadius, true, false);
            ctx.restore();
        },

        /**
         * draw head
         */
        drawHead: function () {
            var fontSize = 56,
                ctx = this.ctx;

            /* draw text of head */
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.font = fontSize + "px " + this.fontFamily;
            ctx.fillStyle = "white";
            ctx.fillText(this.headText, this.rectHead.x, this.rectHead.y + fontSize + this.margin,
                this.rectHead.width);
            ctx.textAlign = "right";
            ctx.fillText(this.points[this.points.length - 1].value.toString(),
                this.rectHead.x + this.rectHead.width,
                this.rectHead.y + fontSize + this.margin);

            /* draw a split line */
            ctx.beginPath();
            ctx.globalAlpha = 0.8;
            ctx.moveTo(this.rectHead.x, this.rectHead.y + this.rectHead.height);
            ctx.lineTo(this.rectHead.x + this.rectHead.width, this.rectHead.y + this.rectHead.height);
            ctx.stroke();

            ctx.restore();
        },

        /* draw chart */
        drawChart: function () {
            var ctx = this.ctx;
            ctx.save();
            ctx.fillStyle = "white";

            /* draw 10 thousand line of x-axis */
            ctx.globalAlpha = 0.6;
            ctx.font = (this.chartFontSize - 5) + "px " + this.fontFamily;
            ctx.fillText("1W", this.rectChartCenter.x + this.rectChartCenter.width,
                this.chartMeanLine + this.chartFontSize / 2.8);
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.dashedLineTo(this.rectChartCenter.x, this.chartMeanLine,
                this.rectChartCenter.x + this.rectChartCenter.width, this.chartMeanLine, [7, 4]);
            ctx.stroke();

            /* draw x-axis text and point */
            ctx.font = this.chartFontSize + "px " + this.fontFamily;
            for (var i = 0; i < this.points.length; i++) {
                /* draw text */
                ctx.textAlign = this.points[i].textAlign;
                ctx.globalAlpha = i == this.points.length - 1 ? 1 :
                    i == this.animationPoint ? 1 : 0.5;
                ctx.fillText(this.points[i].text, this.points[i].x,
                    this.rectChartCenter.y + this.rectChartCenter.height + 1.5 * this.chartFontSize);
            }

            /* out if data unload */
            if (this.isDataLoad == false) {
                ctx.restore();
                return;
            }

            /* draw points and lines */
            for (i = 0; i < this.points.length; i++) {
                /* draw point */
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.arc(this.points[i].x, this.points[i].y, this.points[i].radius, 0, 2 * Math.PI);
                ctx.fill();

                /* draw line */
                if (i != 0) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.lineWidth = 4;
                    ctx.moveTo(this.points[i - 1].x, this.points[i - 1].y);
                    if (this.points[i - 1].value != 0) {
                        ctx.lineTo(this.points[i].x, this.points[i].y);
                    } else {
                        ctx.globalAlpha = 0.5;
                        ctx.dashedLineTo(this.points[i-1].x, this.points[i-1].y,
                            this.points[i].x, this.points[i].y, 7);
                    }
                    ctx.stroke();
                    ctx.restore();
                }
            }

            /* draw a shadow */
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (i = 1; i < this.points.length; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.lineTo(this.rectChartCenter.x + this.rectChartCenter.width,
                this.rectChartCenter.y + this.rectChartCenter.height);
            ctx.lineTo(this.rectChartCenter.x, this.rectChartCenter.y + this.rectChartCenter.height);
            ctx.lineTo(this.points[0].x, this.points[0].y);
            ctx.fillStyle="white";
            ctx.globalAlpha = 0.1;
            ctx.fill();

            ctx.restore();
        },

        /* draw animation step */
        drawStep: function(v) {
            if (this.animationPoint == null || this.animationPoint < 0
                || this.animationPoint >= this.points.length
                || this.isDataLoad == false) {
                return;
            }

            var ctx = this.ctx,
                point = this.points[this.animationPoint],
                lastY = this.rectChartCenter.y - this.chartFontSize * 1.3,
                beginY = point.y,
                textY = (1 - v) * Math.abs(beginY - lastY) + lastY,
                beginAlpha = 0.4,
                endAlpha = 0.8,
                alpha = v * (endAlpha - beginAlpha) + beginAlpha;

            /* draw step number */
            ctx.save();
            ctx.font = 'bold ' + this.chartFontSize + "px " + this.fontFamily;
            ctx.textAlign = this.animationPoint == this.points.length - 1 ? 'right' : point.textAlign;
            ctx.fillStyle = "white";
            ctx.globalAlpha = alpha;
            ctx.fillText(point.value.toString(), point.x, textY);
            ctx.restore();
        },

        /* draw rank */
        drawRank: function () {
            if (this.rankRef == null) {
                return;
            }

            var ctx = this.ctx,
                padding = 20,
                imageRect = {
                    x: this.rectRankAvatar.x + padding,
                    y: this.rectRankAvatar.y + padding,
                    width: this.rectRankAvatar.width - 2 * padding,
                    height: this.rectRankAvatar.height - 2 * padding
                },
                imageRadius = imageRect.width / 2,
                rankRef = this.rankRef;

            /* draw a line */
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(this.rectRank.x, this.rectRank.y);
            ctx.lineTo(this.rectRank.x + this.rectRank.width , this.rectRank.y);
            ctx.moveTo(this.rectRank.x, this.rectRank.y + this.rectRank.height);
            ctx.lineTo(this.rectRank.x + this.rectRank.width , this.rectRank.y + this.rectRank.height);
            ctx.fillStyle = "white";
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.8;
            ctx.stroke();
            ctx.restore();

            /* draw customer avatar image */
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.arc(imageRect.x + imageRadius, imageRect.y + imageRadius, imageRadius, 0, 2 * Math.PI, true);
            ctx.stroke();
            ctx.restore();
            ctx.save();
            ctx.clip();
            ctx.globalAlpha = 1;
            ctx.drawImage(rankRef.avatar, imageRect.x, imageRect.y, imageRect.width, imageRect.height);
            ctx.restore();

            /* draw text */
            ctx.save();
            var fontSize = 36;
            ctx.font = fontSize + "px " + this.fontFamily;
            ctx.fillStyle = "white";
            ctx.globalAlpha = 0.5;
            ctx.fillText(this.rankRef.title, this.rectRankText.x + this.margin,
                this.rectRankText.y + (this.rectRankText.height + fontSize * 3 / 4) / 2,
                this.rectRankText.width);
            ctx.stroke();
            ctx.restore();

            /* draw a arrows button */
            ctx.save();
            var btnPadding = 50,
                btnSmall = {
                    x: this.rectRankBtn.x + 1.6 * btnPadding,
                    y: this.rectRankBtn.y + btnPadding,
                    width: this.rectRankAvatar.width - 2 * btnPadding,
                    height: this.rectRankAvatar.height - 2 * btnPadding
                };
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.moveTo(btnSmall.x, btnSmall.y);
            ctx.lineTo(btnSmall.x + btnSmall.width / 2, btnSmall.y + btnSmall.height / 2);
            ctx.lineTo(btnSmall.x, btnSmall.y + btnSmall.height);
            ctx.lineWidth = 5;
            ctx.globalAlpha = 0.6;
            ctx.stroke();
            ctx.restore();
        },

        /**
         * Draw with animate
         * @param {number} v Value
         */
        drawAnimated: function (v) {
            var self = this,
                el = this.el;

            el.trigger('motion-animation-start');

            $(this.canvas)
                .stop(true, true)
                .css({animationProgress: 0})
                .animate({animationProgress: 1}, $.extend({}, this.animation, {
                    step: function (animationProgress) {
                        var stepValue = self.animationStartValue * (1 - animationProgress) + v * animationProgress;
                        self.drawFrame(stepValue);
                        el.trigger('motion-animation-step', [animationProgress, stepValue]);
                    },
                    complete: function () {
                        el.trigger('motion-animation-end');
                    }
                }));
        },

        /**
         * click function of this element
         * @param e event of click
         */
        clickFuc: function (e) {
            var dataName = 'motion';

            var el = $(this),
                instance = el.data(dataName),
                offset = el.offset(),
                point = {x: e.pageX - offset.left, y: e.pageY - offset.top};

            if (instance.isPointInRect(instance.rectChart, point)) {
                if (instance.isDataLoad) {
                    /* click in chart */
                    var points = instance.points;
                    for(var i = 0; i < points.length; i++) {
                        if (instance.isPointInRect(points[i].rect, point)) {
                            instance.animationPoint = i;
                            if (instance) {
                                instance.draw();
                            }
                            break;
                        }
                    }
                }
            } else if (instance.isPointInRect(instance.rectRank, point)) {
                /* click in rank */
                if (instance.rankRef) {
                    location.href = instance.rankRef.url;
                }
            }

        },

        /**
         * check point is in rect, return true when point in rect
         * @param rect Object {x, y, width, height}
         * @param point Object {x, y}
         */
        isPointInRect: function(rect, point) {
            return point.x >= rect.x && point.x <= rect.x + rect.width
                && point.y >= rect.y && point.y <= rect.y + rect.height;
        }
    };


    /*-------------------------------------------- Initiating jQuery plugin ------------------------------------------*/
    $.wcChart = {
        defaults: WcChart.prototype
    };

    /**
     * Add a customer easing, in effect, it is a easeOutCirc (see easing http://easings.net/zh-cn)
     */
    $.easing.wcChart = function (x, t, b, c, d) {
        return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    };

    /**
     * Draw animated circular progress bar.
     *
     * Appends <canvas> to the element or updates already appended one.
     *
     * If animated, throws 3 events:
     *
     *   - motion-animation-start(jqEvent)
     *   - motion-animation-step(jqEvent, animationProgress, stepValue) - multiple event;
     *                                                                        animationProgress: from 0.0 to 1.0;
     *                                                                        stepValue: from 0.0 to value
     *   - motion-animation-end(jqEvent)
     *
     * @param config Example: { value: 0.75, width: 920, height: 600, animation: false };
     *                you may set any of public options;
     *                `animation` may be set to false;
     */
    $.fn.wcChart = function (config) {
        var dataName = 'motion';

        if (config == 'widget') {
            var data = this.data(dataName);
            return data && data.canvas;
        }

        var el = $(this),
            instance = el.data(dataName),
            cfg = $.isPlainObject(config) ? config : {};

        if (instance) {
            instance.init(cfg);
        } else {
            cfg.el = el;
            instance = new WcChart(cfg);
            el.data(dataName, instance);
        }

        return this;
    };

    /**
     * Add a round rect draw in the 2D context
     * @param x number, begin of x-axis
     * @param y number, begin of y-axis
     * @param width number,
     * @param height number
     * @param radius number, radius of quad curve
     * @param fill bool, fill
     * @param stroke bool, stroke
     */
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius, fill, stroke) {
        stroke = typeof  stroke == "undefined" ? true : stroke;
        stroke = typeof  stroke == "undefined" ? true : stroke;
        radius = typeof  radius == "undefined" ? 5 : radius;

        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();

        if (stroke) {
            this.stroke();
        }

        if (fill) {
            this.fill();
        }
    };

    /**
     *
     * @param fromX number, x-axis
     * @param fromY number,
     * @param toX number,
     * @param toY number,
     * @param pattern deltay
     */
    CanvasRenderingContext2D.prototype.dashedLineTo = function (fromX, fromY, toX, toY, pattern) {
        var interval = 0, padding = 0;
        if (typeof pattern === "undefined") {
            padding = 5;
            interval = 5;
        } else {
            if (pattern.constructor === Array) {
                padding = pattern[0];
                interval = pattern[1];
            } else {
                padding = interval = pattern;
            }
        }

        /* calculate the delta x and delta y */
        var dx = (toX - fromX);
        var dy = (toY - fromY);
        var distance = Math.floor(Math.sqrt(dx * dx + dy * dy));
        var unitLength = padding + interval;
        var dashLineInterval = (unitLength <= 0) ? distance : Math.floor(distance / unitLength);
        var deltaPaddingY = (dy / distance) * padding;
        var deltaPaddingX = (dx / distance) * padding;
        var unitLengthX = (dx / distance) * unitLength;
        var unitLengthY = (dy / distance) * unitLength;

        /* draw dash line */
        var x = fromX, y = fromY;
        for (var dl = 0; dl < dashLineInterval; dl++) {
            this.moveTo(x, y);
            this.lineTo(x + deltaPaddingX, y + deltaPaddingY);
            x += unitLengthX;
            y += unitLengthY;
        }
    };
})(jQuery);