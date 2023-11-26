library(tidyverse)

df = read_csv("met_data_shaped.csv")

df %>%
  mutate(
    year = DateAcquired_yr,
    nb = replace_na(`non-binary`, 0),
    f = female, 
    fnb = female + nb,
    m = male,
    ratio = fnb / m,
         f_ratio = fnb / (fnb + m), 
         m_ratio = m / (fnb + m)
         ) -> df



# 1.) Gender ratio of acquisitions by year
df %>%
  ggplot() +
  geom_point(aes(year, m_ratio, color = 'm_ratio')) +
  geom_point(aes(year, f_ratio, color = 'f_ratio')) +
  geom_hline(aes(yintercept = 0.5))


year_range <- range(df$year)
year_range_seq <- pretty(year_range, n = 10)







# 2.) Pyramid plot of acquisitions by gender by year
df %>%
  select(year, f, m, nb) %>%
  mutate(
  m = -1*m  
  ) %>%
  pivot_longer(
    cols = !year, 
    names_to = "gender", 
    values_to = "count") %>%
  ggplot(
       aes(x = count,
           y = factor(year),
           fill = gender)) +
  geom_col() +
  scale_y_discrete(breaks  = year_range_seq,
                     labels = scales::comma(abs(year_range_seq))) +
  scale_fill_brewer(palette = "Dark2",
                    guide = guide_legend(
                      title = ""
                    )) +
  theme_minimal() +
  theme(legend.position = "top")


# install.packages("extrafont")
library(ggtext)
library(extrafont)
  

# font_import()  #run once
loadfonts(device = "all") #run once per session
df %>%
  mutate(
    diff = m - fnb
  ) %>%
  select(m, fnb, diff, year) %>%
  pivot_longer(cols = c(m, fnb),
               names_to = "gender", 
               values_to = "count") -> db
males <- db %>%
  filter(gender == "m", year >=1973)
females <- db %>%
  filter(gender == "fnb", year >=1973)






# 3.) barbell plot of acquisitions by gender by year
db %>%
  filter(year >= 1973) %>%
  ggplot()+
  geom_segment(data = males,
               aes(x = count, y = year,
                   yend = females$year, xend = females$count), #use the $ operator to fetch data from our "Females" tibble
               color = "#aeb6bf",
               size = 1.5, #Note that I sized the segment to fit the points
               alpha = .5) +
  
  geom_point(aes(x = count, y = year, color = gender), size = 4, show.legend = TRUE)






# 3.) Time series of acquisitions by gender by year
db %>%
  ggplot() + 
  geom_line(aes(year, count, color=gender))






artists = read_csv("../data/Artists.csv")
artworks = read_csv("../data/Artworks.csv")

artworks %>%
  filter(!grepl(',', ConstituentID)) %>%
  mutate(ConstituentID = as.integer(ConstituentID)) -> art

left_join(artists, art, by="ConstituentID") -> all

all %>%
  mutate(gender = str_to_lower(Gender.x))%>%
  filter(!is.na(gender)) -> gendered

gendered %>%
  select(ConstituentID, gender, Artist, Title, Date, Medium, Classification, Department, DateAcquired) -> ff

ff %>%
  ggplot() + 
  geom_point(aes(DateAcquired, Department, color=Department)) #+ 
  #facet_grid(~gender)

library(lubridate)

ff %>%
  mutate(year = year(DateAcquired)) %>%
  group_by(year, gender, Classification) %>%
  summarise(total = n()) %>%
  mutate(total = case_when(
    gender == "female" ~ total *-1,
    gender == "male" ~ total *1
  )) %>%
  filter(Classification != "Print",
         Classification != "Drawing",
         Classification != "Illustrated Book",
         Classification != "Photograph") %>%
  ggplot() + 
  geom_point(aes(year, total, color=gender)) +
  ylim(-200, 200) +
  facet_wrap(~Classification)
  


