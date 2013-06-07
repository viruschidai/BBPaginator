;/**
  * @author billg(viruschidai@gmail.com)
  * This is a backbone.js based paginator.
  */
(function() {
  var BBPaginator;

  if (typeof exports !== "undefined") {
    BBPaginator = exports;
  } else {
    BBPaginator = this.BBPaginator = {};
  }

  BBPaginator.VERSION = "0.1.0";

  BBPaginator.PaginationModel = Backbone.Model.extend({
    defaults: {
      pageSize: 10,
      page: 0,
      firstPage: 0,
      numOfPages: 0,
      numOfRecords: 0
    },

    initialize: function() {
      this.on("change:numOfRecords change:pageSize", function() {
          var pageSize = this.get("pageSize"),
            numOfRecords = this.get("numOfRecords"),
            numOfPages = this.get("pageSize") === 0 ? (numOfRecords > 0 ? 1 : 0) : Math.ceil(numOfRecords / pageSize);

          this.set("numOfPages", numOfPages);

          if (this.get("page") >= numOfPages) {
            this.set("page", (numOfPages - 1));
          }
        }
      );
    },

    validate: function(attrs, options) {
      if (attrs.pageSize < 0) {
          return "Invalid pageSize value [" + attrs.pageSize + "]";
      };

      if (attrs.page < 0 || attrs.page > this.get('numOfPages') - 1) {
          return "Invalid currentPage value [" + attrs.currentPage + "]";
      };
    }
  });

  var PageSelectorView = BBPaginator.PageSelectorView = Backbone.View.extend({
    tagName: "div",

    windowSize: 5,

    className: "pagination numbers",

    fastForwardings: {
      "first": "<<",
      "last": ">>",
      "prev": "<",
      "next": ">"
    },

    template: _.template("<ul class='page-selector'>"
                + "	<% _.each(pages, function(page) { %>"
                + " 	<li class='page <%= page.cssClass %>'><a href='#'><%= page.label %></a></li>"
                + " <% }) %>"
                + "	</ul>"
                ),

    events: {
      "click .page": "onClickChangePage"
    },

    initialize: function(options) {
      options = options || {}
      this.windowSize = options.windowSize || this.windowSize;
      _.bindAll(this, 'render');
      this.model.on('change', this.render)
    },

    render: function() {
      this.$el.empty();
      pages = this.getDisplayPages();
      this.$el.html(this.template(pages));
      return this;
    },

    getDisplayPages: function() {
      if(this.model.get("numOfPages") > 0) {
        var page = this.model.get("page"),
          numOfPages = this.model.get("numOfPages"),
          startPage = Math.max(1, Math.min(page + 1 - parseInt(this.windowSize/2), numOfPages + 1 - this.windowSize)),
          endPage = Math.min(this.model.get("numOfPages")+1, startPage + this.windowSize);

        var result = [
          {label: this.fastForwardings.first, cssClass: page == 0 ? "disabled" : ""},
          {label: this.fastForwardings.prev, cssClass: page == 0 ? "disabled" : ""},
        ];

        var range = _.range(startPage, endPage, 1);
        _.each(range, function(pageNum) {
          result.push({label: pageNum, cssClass: page + 1 === pageNum ? "active" : ""});
        });

        result = result.concat([
            {label: this.fastForwardings.next, cssClass: page + 1 == numOfPages ? "disabled" : ""},
            {label: this.fastForwardings.last, cssClass: page + 1 == numOfPages ? "disabled" : ""},
            ]);

        return result;
      } else {
        return [];
      }
    },

    onClickChangePage: function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var pageStr = $(ev.target).text().trim();
      var pageIndex = this.convertPageIndex(pageStr);
      this.model.set("page", pageIndex, {validate: true});
    },

    convertPageIndex: function(pageStr) {
      var page = 0,
      page = this.model.get("page"),
      numOfPages = this.model.get("numOfPages");

      switch(pageStr){
        case this.fastForwardings.first:
          page = Math.min(0, numOfPages - 1);
          break;
        case this.fastForwardings.prev:
          page = Math.max(0, page - 1);
          break;
        case this.fastForwardings.next:
          page = Math.min(page + 1, numOfPages - 1);
          break;
        case this.fastForwardings.last:
          page = Math.max(0, numOfPages - 1);
          break;
        default:
          page = parseInt(pageStr) - 1;
      }

      return page;
    }

  });

  var GotoPageView = BBPaginator.GotoPageView= Backbone.View.extend({
    tagName: "div",

    className: "pagination goto",

    events: {
      "blur input": "changePage",
      "keypress input": "changePageOnEnter"
    },

    template: _.template("Goto <input type='text' value='<%= page + 1 %>'/> of <%= numOfPages %>"),

    initialize: function() {
      _.bindAll(this, 'render');
      this.model.on('change', this.render)
    },

    render: function() {
      this.$el.empty();
      this.$el.html(this.template(this.model.attributes));
      return this;
    },

    changePage: function(ev) {
      var pageStr = $(ev.target).val();
      var pageIndex = +pageStr - 1; 
      if (_.isNaN(pageIndex) || (pageIndex > (this.model.get('numOfPages') - 1))) {
        $(ev.target).val(this.model.get('page') + 1);
      };
      this.model.set("page", pageIndex, {validate: true});
    },

    changePageOnEnter: function(ev) {
      if (ev.keyCode != 13) return;
      this.changePage(ev);
    }
  });

  BBPaginator.PaginatorView = Backbone.View.extend({
    tagName: "div",

    className: "paginator",

    initialize: function() {
      this.pageSelector = new PageSelectorView({model: this.model}); 
      this.gotoPage = new GotoPageView({model: this.model}); 
    },

    render: function() {
      this.$el.empty();
      this.$el.append(this.pageSelector.render().el);
      var gotoEl = this.gotoPage.render().el;
      $(gotoEl).addClass("pull-right");
      this.$el.append(this.gotoPage.render().el);
      return this;
    }
  });

}).call(this);

