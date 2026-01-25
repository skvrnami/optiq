# download data from Nodegoat

library(httr)
library(tibble)
library(dplyr)
library(tidyr)

Q_AUTHOR_ID <- 11570
Q_TEXT_ID <- 11571
Q_MANUSCRIPT <- 11572
Q_MANU_COPY <- 11573
P_TEXT_ID <- 11574
P_COPY_ID <- 11575

get_object_data <- function(object_id, token = Sys.getenv("OPTIQ_TOKEN")){
  url <- glue::glue("https://api.nodegoat.hiu.cas.cz/project/2999/data/type/{object_id}/object/data")
  response <- GET(url, add_headers(Authorization = paste("Bearer", token)))
  content(response)
}
    
parse_authors <- function(objects) {
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            name = x$object_definitions$`37035`$object_definition_value, 
            # rag = x$object_definitions$`35373`$object_definition_value, 
            # origin = x$object_definitions$`35410`$object_definition_value
        )
    })
}

author_data <- get_object_data(Q_AUTHOR_ID)
author_df <- author_data$data$objects |> 
  parse_authors()

saveRDS(author_df, "app/data/authors.rds")


parse_q_text <- function(objects){
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            sigla = x$object_definitions$`37037`$object_definition_value,
            title = x$object_definitions$`37041`$object_definition_value,
            origin = x$object_definitions$`37042`$object_definition_value,
            note = x$object_definitions$`37046`$object_definition_value,
            literature = x$object_definitions$`37050`$object_definition_value,
            edition = x$object_definitions$`37047`$object_definition_value,
            edition_note = x$object_definitions$`37049`$object_definition_value

            # author_id = purrr::map_chr(x$relations$`11575`, "related_object_id"),
            # text = x$object_definitions$`37034`$object_definition_value
        )
    })
}

q_text_data <- get_object_data(Q_TEXT_ID)
# q_text_data$data$objects |> purrr::keep(.p = function(x) x$object$nodegoat_id == "ngAH6I68lAHInBnElBJ4nGRBXAzJqEnJPAJAn")

q_text_df <- q_text_data$data$objects |> 
  parse_q_text()

saveRDS(q_text_df, "app/data/q_text.rds")

q_manuscript_data <- get_object_data(Q_MANUSCRIPT)

parse_q_manuscript <- function(objects){
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            city = x$object_definitions$`37052`$object_definition_value,
            institution = x$object_definitions$`37053`$object_definition_value,
            shelfmark = x$object_definitions$`37054`$object_definition_value,
            notes_manuscript = x$object_definitions$`37056`$object_definition_value,
            manu_full = x$object_definitions$`37077`$object_definition_value
        )
    })
}

q_manuscript_data$data$objects |> purrr::keep(.p = function(x) x$object$nodegoat_id == "ngSZ3K28dUJA3TfWeUB05YJrPSrBiWfLHULS3")
q_manuscript_df <- q_manuscript_data$data$objects |> 
  parse_q_manuscript()

saveRDS(q_manuscript_df, "app/data/q_manuscript.rds")

q_manu_copy_data <- get_object_data(Q_MANU_COPY)

parse_q_manu_copy <- function(objects){
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            title = x$object_definitions$`37060`$object_definition_value,
            manuscript = x$object_definitions$`37061`$object_definition_value,
            foliation = x$object_definitions$`37062`$object_definition_value
        )
    })
}

q_manu_copy_df <- q_manu_copy_data$data$objects |> 
  parse_q_manu_copy()

saveRDS(q_manu_copy_df, "app/data/q_manu_copy.rds")

p_text_data <- get_object_data(P_TEXT_ID)
parse_p_text <- function(objects){
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            title = x$object_definitions$`37067`$object_definition_value,
            title_q = x$object_definitions$`37068`$object_definition_value,
            origin = x$object_definitions$`37069`$object_definition_value,
            note = x$object_definitions$`37071`$object_definition_value,
            
            # sigla = x$object_definitions$`37065`$object_definition_value,
            # literature = x$object_definitions$`37078`$object_definition_value,
            # edition = x$object_definitions$`37075`$object_definition_value,
            # edition_note = x$object_definitions$`37077`$object_definition_value
        )
    })
}

# p_text_data$data$objects |> purrr::keep(.p = function(x) x$object$nodegoat_id == "ngAH4E08lAnI5BnS0A182GRNXCTJqEnFPA1A5")
p_text_df <- p_text_data$data$objects |> 
  parse_p_text()

saveRDS(p_text_df, "app/data/p_text.rds")

p_copy_data <- get_object_data(P_COPY_ID)

parse_p_copy <- function(objects){
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            full_manuscript = x$object_definitions$`37082`$object_definition_value,
            foliation = x$object_definitions$`37083`$object_definition_value,
        )
    })
}

p_copy_df <- p_copy_data$data$objects |> 
  parse_p_copy()

saveRDS(p_copy_df, "app/data/p_copy.rds")