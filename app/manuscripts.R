box::use(
  shiny[h3, moduleServer, NS, div, tagList, a],
  DT[DTOutput, renderDataTable, JS],
  httr[GET, content, add_headers],
  tibble[tibble],
  purrr[map2_chr],
  dplyr[select, left_join, arrange]
)

#' @export
ui <- function(id) {
  ns <- NS(id)

  tagList(
    h3("Manuscripts"),
    DTOutput(ns("manuscripts"))
  )
}

#' @export
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    copies <- readRDS("app/data/manuscript_copies.rds") |>
      select(manuscript, text, date, title = text) |>
      unique()
    authors <- readRDS("app/data/authors.rds") |>
      select(author_id = id, name)
    works <- readRDS("app/data/works.rds") |>
      select(text_id = id, sigla, title, author) |>
      left_join(authors, by = c("author" = "name"))
    manuscripts <- readRDS("app/data/manuscripts.rds") |>
      left_join(copies, by = "manuscript") |>
      left_join(works, by = "title")

    output$manuscripts <- renderDataTable(
      {
        m_table <- manuscripts |>
          arrange(title, manuscript)

        return(
          m_table |>
            select(
              id,
              Shelfmark = manuscript,
              Author = author,
              Siglum = sigla,
              Title = title,
              Origin = date,
              Facsimile = facsimile,
              author_id
            )
        )
      },
      escape = FALSE,
      rownames = FALSE,
      options = list(
        ordering = TRUE,
        pageLength = 50,
        columnDefs = list(
          list(
            targets = 1,
            render = JS(
              "function(data, type, row, meta) {
                    if (type === 'display') {
                    data = '<a href=\"#!/manuscript_detail?manuscriptId=' + 
                    row[0] + '\" >' + row[1] + '</a>';
                    }
                    return data;
                    }"
            )
          ),
          list(
            targets = 2,
            render = JS(
              "function(data, type, row, meta) {
                    if (type === 'display') {
                    data = '<a href=\"#!/author_detail?authorId=' + 
                    row[7] + '\" >' + row[2] + '</a>';
                    }
                    return data;
                    }"
            )
          ),
          list(
            targets = 6,
            render = JS(
              "function(data, type, row, meta) {
                    if (type === 'display') {
                    if (!!row[6]) {
                    data = '<a href=\"' + 
                    row[6] + '\" ><img width=\"20\" height=\"20\" src=\"https://img.icons8.com/ios/50/link--v1.png\"/></a>';
                    }
                    }
                    return data;
                    }"
            )
          ),
          list(visible = FALSE, targets = 0),
          list(visible = FALSE, targets = 7)
        )
      )
    )
  })
}
