library(stringr)

reportes <- read.csv("reports_cp.csv")

cp_factors <- factor(reportes$postalCode)
cp_levels <- levels(cp_factors) # los distintos codigos postales

sa <- data.frame(codigo_postal = character(0), reportes = numeric(0))
names(sa) <- c("codigo_postal", "reportes")

for(cp in cp_levels) {
  filter_cp <- reportes$postalCode == cp
  
  reportes_cp <- nrow(reportes[filter_cp,])
  
  cp_s <- str_pad(cp, 5, pad = "0")
  reporte <- data.frame(cp_s, reportes_cp)
  names(reporte) <- c("codigo_postal", "reportes")
  
  sa <- rbind(sa, reporte)
}
write.csv(sa, file = "reportes_procesado.csv")
