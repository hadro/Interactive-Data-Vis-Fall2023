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

df %>%
  ggplot() +
  geom_point(aes(year, m_ratio, color = 'm_ratio')) +
  geom_point(aes(year, f_ratio, color = 'f_ratio')) +
  geom_hline(aes(yintercept = 0.5))


year_range <- range(df$year)
year_range_seq <- pretty(year_range, n = 10)

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
  