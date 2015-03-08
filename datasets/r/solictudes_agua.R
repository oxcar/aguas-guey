library(stringr)

solicitudes <- read.csv("solicitudes_agua.csv")

cp_factors <- factor(solicitudes$codigo_postal_solicitante)
cp_levels <- levels(cp_factors) # los distintos codigos postales

sa <- data.frame(codigo_postal = character(0), tandeo = numeric(0), normal = numeric(0))
names(sa) <- c("codigo_postal", "tandeo", "normal")

for(cp in cp_levels) {
  filter_cp <- solicitudes$codigo_postal_solicitante == cp
  filter_tandeo <- solicitudes$tipo_solicitud == "Tandeo"
  filter_normal <- solicitudes$tipo_solicitud == "Normal"
  
  solicitudes_cp_tandeo <- nrow(solicitudes[filter_cp & filter_tandeo,])
  solicitudes_cp_normal <- nrow(solicitudes[filter_cp & filter_normal,])
  
  cp_s <- str_pad(cp, 5, pad = "0")
  registro <- data.frame(cp_s, solicitudes_cp_tandeo, solicitudes_cp_normal)
  names(registro) <- c("codigo_postal", "tandeo", "normal")
  
  sa <- rbind(sa, registro)
}
write.csv(sa, file = "solicitudes_agua_procesado.csv")
