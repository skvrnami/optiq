

# curl https://api.nodegoat.hiu.cas.cz/project/2966/data/type/11212/object/ -H 'Authorization: Bearer TOKEN

# Nastavení API

# Kde najít project ID
# Management > Projects > edit

# Kde najít ID typů
# Model > Object types > edit

# Kde najít token

library(httr)
library(tibble)

# Authors
parse_authors <- function(objects) {
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            name = x$object_definitions$`35365`$object_definition_value, 
            alternative_name = x$object_definitions$`35366`$object_definition_value, 
            author_wiki = x$object_definitions$`35373`$object_definition_value, 
            origin = x$object_definitions$`35410`$object_definition_value
        )
    })
}

token <- Sys.getenv("OPTIQ_TOKEN")

get_authors <- function(author_id, token){
    url <- glue::glue("https://api.nodegoat.hiu.cas.cz/project/2968/data/type/{author_id}/object/data")
    response <- GET(url, add_headers(Authorization = paste("Bearer", token)))
    con <- content(response)
    parse_authors(con$data$objects)
}

authors <- get_authors(author_id = 11223, 
            token = token)

saveRDS(authors, "app/data/authors.rds")

# Dílo
parse_works <- function(objects){
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            author = x$object_definitions$`35392`$object_definition_value, 
            title = x$object_definitions$`35367`$object_definition_value, 
            translator = x$object_definitions$`35370`$object_definition_value, 
            translator_wiki = x$object_definitions$`35417`$object_definition_value, 
            translation_from = x$object_definitions$`35418`$object_definition_value, 
            translation_to = x$object_definitions$`35419`$object_definition_value, 
            edition = x$object_definitions$`35371`$object_definition_value, 
            edition_link = x$object_definitions$`35372`$object_definition_value, 
            literature = x$object_definitions$`35390`$object_definition_value, 
            notes = x$object_definitions$`35391`$object_definition_value
        )
    })
}

dilo_id <- 11224
get_works <- function(dilo_id, token){
    url <- glue::glue("https://api.nodegoat.hiu.cas.cz/project/2968/data/type/{dilo_id}/object/data")
    response <- GET(url, add_headers(Authorization = paste("Bearer", token)))
    con <- content(response)
    
    parse_works(con$data$objects)
}

works <- get_works(dilo_id, token) 

saveRDS(works, "app/data/works.rds")

parse_manuscripts <- function(objects){
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            manuscript = x$object_definitions$`35374`$object_definition_value, 
            catalogue = x$object_definitions$`35375`$object_definition_value, 
            catalogue_link = x$object_definitions$`35376`$object_definition_value, 
            digital_copy = x$object_definitions$`35377`$object_definition_value, 
            facsimile = x$object_definitions$`35378`$object_definition_value, 
            iihf = x$object_definitions$`35379`$object_definition_value, 
            grid = x$object_definitions$`35381`$object_definition_value, 
            wikidata = x$object_definitions$`35382`$object_definition_value, 
            gnd = x$object_definitions$`35383`$object_definition_value
        )
    })
}

manuscript_id <- 11225

get_manuscripts <- function(manuscript_id, token){
    url <- glue::glue("https://api.nodegoat.hiu.cas.cz/project/2968/data/type/{manuscript_id}/object/data")
    response <- GET(url, add_headers(Authorization = paste("Bearer", token)))
    con <- content(response)
    
    parse_manuscripts(con$data$objects)
}

manuscripts <- get_manuscripts(manuscript_id, token)

saveRDS(manuscripts, "app/data/manuscripts.rds")

parse_copies <- function(objects){
    purrr::map_df(objects, function(x) {
        tibble(
            id = x$object$nodegoat_id,
            text = x$object_definitions$`35411`$object_definition_value, 
            incipit = x$object_definitions$`35412`$object_definition_value, 
            manuscript = x$object_definitions$`35413`$object_definition_value, 
            foliation = x$object_definitions$`35414`$object_definition_value, 
            # TODO: scribe
            date = x$object_definitions$`35415`$object_definition_value, 
            sigla = x$object_definitions$`35420`$object_definition_value,
            note = x$object_definitions$`35421`$object_definition_value,
        )
    })
}

manuscript_copy_id <- 11231
get_manuscript_copies <- function(manuscript_copy_id, token){
    url <- glue::glue("https://api.nodegoat.hiu.cas.cz/project/2968/data/type/{manuscript_copy_id}/object/data")
    response <- GET(url, add_headers(Authorization = paste("Bearer", token)))
    con <- content(response)
    
    parse_copies(con$data$objects)
}

manuscript_copies <- get_manuscript_copies(manuscript_copy_id, token)

saveRDS(manuscript_copies, "app/data/manuscript_copies.rds")


