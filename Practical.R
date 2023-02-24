rm(list=ls())

library(httr); 
library(jsonlite)
library(growthrates)

experiment <- "ds001a3"
request <- GET(paste("http://localhost:3000/api/datapoints/ds001a1"))
print(request)
response <- content(request, as = "text", encoding ="UTF-8")
#r_object <- fromJSON(readLines("package.json"))
df <-  fromJSON (response)

print(df)

x11()
plot(df)

#modelised a growth curve
fit <- fit_spline(df$time, df$cfu)
plot(fit)
coef(fit) #report on the growth coeff
