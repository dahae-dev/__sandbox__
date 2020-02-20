# import libraries
import urllib2
from bs4 import BeautifulSoup
from datetime import date
import calendar

input_from = 'JPY'
output_to = 'KRW'

today = date.today()
year = 2019
month = 1
month_str = calendar.month_abbr[month]

last_year = year - 1
indexing = month - 1

# specify the url
this_url = 'https://www.x-rates.com/average/?from=%s&to=%s&amount=1&year=%s' % (input_from, output_to, year)
last_url = 'https://www.x-rates.com/average/?from=%s&to=%s&amount=1&year=%s' % (input_from, output_to, last_year)

# quote_page = ['https://www.x-rates.com/average/?from=%s&to=%s&amount=1&year=%s' % (input_from, output_to, year), 'https://www.x-rates.com/average/?from=%s&to=%s&amount=1&year=%s' % (input_from, output_to, last_year)]
# print(quote_page)

# query the website and return the html to the variable 'page'
this_page = urllib2.urlopen(this_url)
last_page = urllib2.urlopen(last_url)

# parse the html using beautiful soup and store in variable 'soup'
this_soup = BeautifulSoup(this_page, 'html.parser')
last_soup = BeautifulSoup(last_page, 'html.parser')

# Take out the <div> of name and get its value
this_ul = this_soup.find('ul', attrs={'class': 'OutputLinksAvg'})
last_ul = last_soup.find('ul', attrs={'class': 'OutputLinksAvg'})

last_data = []
this_data = []
rate_list = []
print("last year ", last_year)
for li in last_ul.findAll('li')[indexing:]:
  print(li)
  month_el = li.find('span', attrs={'class': 'avgMonth'})
  month = month_el.text.strip()
  rate_el = li.find('span', attrs={'class': 'avgRate'})
  rate = float(rate_el.text.strip())
  last_data.append((month, rate))
  rate_list.append(rate)

print("this year ", year)
for li in this_ul.findAll('li')[0:indexing]:
  print(li)
  month_el = li.find('span', attrs={'class': 'avgMonth'})
  month = month_el.text.strip()
  rate_el = li.find('span', attrs={'class': 'avgRate'})
  rate = float(rate_el.text.strip())
  this_data.append((month, rate))
  rate_list.append(rate)

data = {}
data[last_year] = dict(last_data)
data[year] = dict(this_data)
avg = sum(rate_list) / len(rate_list)

print "data:", data
print "avg:", avg

###

# month_list = soup.find_all('span', attrs={'class': 'avgMonth'})
# rate_list = soup.find_all('span', attrs={'class': 'avgRate'})

# print(month_list)
# print(rate_list)