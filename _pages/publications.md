---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
classes: wide
---

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}
