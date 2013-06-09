// Wrap BBPaginator into a jQuery plugin
;(function($) {
  $.fn.paginator = function(options) {
    options = $.extend({
      page: 0,
      pageSize: 10,
      numOfPages: 3,
      numOfRecords: 30
    }, options);

    return this.each(function() {
      var modelSettings = _.pick(options, 'page', 'pageSize', 'numOfPages', 'numOfRecords'),
          model = new BBLib.PaginationModel(modelSettings);

      if ($.isFunction(options.onPageChange)) {
        model.on('change:page', options.onPageChange);
      };
      
      var $this = $(this),
          view = new BBLib.PaginatorView({model: model, el: $this});

      $this.empty();
      $this.append(view.render().el);

      $this.data('model', model);
      $this.data('view', view);
    });
  }
})(jQuery);

