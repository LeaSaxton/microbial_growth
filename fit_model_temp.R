#Script that will estimate and report the growth rate based on time
#and cfu measurements

# 'needs' instead of 'library' or'require' for r-script
needs(growthrates)
attach(input[[1]])

temp_list <- unique(temperatures)
growth_coef <- c()

for (j in 1:length(temp_list)){
  cfus_list <- c()
  times_list <- c()
  for(i in 1:length(temperatures)){
    if (temperatures[i] == temp_list[j]){
      cfus_list <- append(cfus_list, cfus[i])
      times_list <- append(times_list, times[i])
    }
  }
  fit <-  fit_spline(times_list, cfus_list)
  growth_coef <- append(growth_coef,coef(fit)['mumax'] )
}
df <- data.frame(temp_list, growth_coef)







