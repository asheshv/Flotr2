/**
 * Flotr Event Adapter
 */
(function () {
var
  F = Flotr,
  bean = F.bean;
F.EventAdapter = {
  observe: function(object, name, callback) {
    bean.add(object, name, callback);
    return this;
  },
  fire: function(object, name, args) {
    bean.fire(object, name, args);
    if (typeof(Prototype) != 'undefined')
      Event.fire(object, name, args);
    // @TODO Someone who uses mootools, add mootools adapter for existing applciations.
    return this;
  },
  stopObserving: function(object, name, callback) {
    bean.remove(object, name, callback);
    return this;
  },
  eventPointer: function(e) {
    if (!F._.isUndefined(e.touches) && e.touches.length > 0) {
      return {
        x : e.touches[0].pageX,
        y : e.touches[0].pageY
      };
    } else if (!F._.isUndefined(e.changedTouches) && e.changedTouches.length > 0) {
      return {
        x : e.changedTouches[0].pageX,
        y : e.changedTouches[0].pageY
      };
    } else if (e.pageX || e.pageY) {
      return {
        x : e.pageX,
        y : e.pageY
      };
    } else if (e.clientX || e.clientY) {
      return {
        x: e.clientX + ((window.pageXOffset !== undefined) ? window.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft),
        y: e.clientY + ((window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop)
      };
    }
  }
};
})();
