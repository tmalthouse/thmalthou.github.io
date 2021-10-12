require 'cgi'

module Jekyll
    module CategoryFilter
      def redef_url_encode(input)
        CGI.escape(input.to_s) unless input.nil?
      end

      def category_link(input)
        input.map {
          |category|
          "<a href=\"%{catpath}%{url_cat}/index.html\">%{cat}</a>" % {
            url: @context.registers[:site].config["url"],
            catpath: @context.registers[:site].config["category_path"],
            url_cat: redef_url_encode(category),
            cat: category}
        }
      end
    end
  end

Liquid::Template.register_filter(Jekyll::CategoryFilter)