box::use(
  shiny[fluidPage, titlePanel, fluidRow, sidebarLayout, sidebarPanel, mainPanel, 
        div, p, moduleServer, NS, renderUI, tags, uiOutput, a, img, h1],
  shiny.router[router_ui, router_server, route, route_link]
)

box::use(
  app/intro,
  app/authors,
  app/author_detail,
  app/manuscripts,
  app/manuscript_detail,
  app/mirador,
  app/texts,
  app/text_detail
)

#' @export
ui <- function(id) {
  ns <- NS(id)
  
  fluidPage(
    sidebarLayout(
      div(class = "col-sm-2", 
          h1("OptiQ"),
          img(src = "static/f_zakladni_text_vedle_velky_cb.jpg", 
              width = 180),
          tags$ul(
            tags$li(
              a("Home", href = route_link("/"))
            ),
            tags$li(
              a("Authors", href = route_link("authors"))
            ),
            tags$li(
              a("Manuscripts", href = route_link("manuscripts"))
            ),
            tags$li(
              a("Texts", href = route_link("texts"))
            )
          )
      ),
      # sidebarPanel(
      #   img(src = "static/f_zakladni_text_vedle_velky_cb.jpg", 
      #       width = 180),
      #   tags$ul(
      #     tags$li(
      #       a("Home", href = route_link("/"))
      #     ),
      #     tags$li(
      #       a("Authors", href = route_link("authors"))
      #     ),
      #     tags$li(
      #       a("Manuscripts", href = route_link("manuscripts"))
      #     ),
      #   ), 
      #   width = 3
      # ),
      mainPanel(
        router_ui(
          route("/", intro$ui(ns("intro"))),
          route("authors", authors$ui(ns("authors"))),
          route("author_detail", author_detail$ui(ns("author_detail"))),
          route("manuscripts", manuscripts$ui(ns("manuscripts"))),
          route("manuscript_detail", manuscript_detail$ui(ns("manuscript_detail"))),
          route("mirador", mirador$ui(ns("mirador"))),
          route("texts", texts$ui(ns("texts"))),
          route("text_detail", text_detail$ui(ns("text_detail")))
        ), 
        width = 9
      )
    ), 
    fluidRow(
      tags$footer(
        "© The Institute of Philosophy of the Czech Academy of Sciences | OptiQ 2023-2025", 
        div(
          img(src = "static/lindat-clariah-cz-black-lines.png", width = 120), 
          img(src = "static/memori.png", width = 180), 
          img(src = "static/f_zakladni_text_vedle_velky_cb.jpg", width = 180),
          img(src = "static/msmt_logo_text_grey_eng.png", width = 160)
        ), 
        p('The Lindat/CLARIAH-CZ project (LM2023062) is fully supported by the Ministry of Education, Youth, and Sports of the Czech Republic under the programme LM of "Large Infrastructures".')
        )
    )
  )
  
  # bootstrapPage(
  #   tags$nav(
  #     class = "navbar",
  #     tags$ul(
  #       class = "nav navbar-nav",
  #       tags$li(
  #         a("Home", href = route_link("/"))
  #       ),
  #       tags$li(
  #         a("Authors", href = route_link("authors"))
  #       ),
  #       tags$li(
  #         a("Manuscripts", href = route_link("manuscripts"))
  #       ),
  #     )
  #   ),
  #   router_ui(
  #     route("/", intro$ui(ns("intro"))),
  #     route("authors", authors$ui(ns("authors"))),
  #     route("manuscripts", manuscripts$ui(ns("manuscripts"))),
  #     route("manuscript_detail", manuscript_detail$ui(ns("manuscript_detail")))
  #   )
  # )
}

#' @export
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    router_server("/")
    
    intro$server("intro")
    authors$server("authors")
    author_detail$server("author_detail")
    manuscripts$server("manuscripts")
    manuscript_detail$server("manuscript_detail")
    mirador$server("mirador")
    texts$server("texts")
    text_detail$server("text_detail")
  })
}
