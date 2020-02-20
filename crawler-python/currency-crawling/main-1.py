# import libraries
import urllib2
from bs4 import BeautifulSoup
from datetime import date
import calendar

input_from = 'JPY'
output_to = 'KRW'

today = date.today()
year = today.year
month = today.month
month_str = calendar.month_abbr[month]

last_year = year - 1
indexing = month - 1

this_url = 'https://www.x-rates.com/average/?from=%s&to=%s&amount=1&year=%s' % (input_from, output_to, year)
last_url = 'https://www.x-rates.com/average/?from=%s&to=%s&amount=1&year=%s' % (input_from, output_to, last_year)

this_page = urllib2.urlopen(this_url)
this_soup = BeautifulSoup(this_page, 'html.parser')

last_page = urllib2.urlopen(last_url)
last_soup = BeautifulSoup(last_page, 'html.parser')

this_ul = this_soup.find('ul', attrs={'class': 'OutputLinksAvg'})
last_ul = last_soup.find('ul', attrs={'class': 'OutputLinksAvg'})

rate_list = []
for li in last_ul.findAll('li')[indexing:]:
  rate_el = li.find('span', attrs={'class': 'avgRate'})
  rate = float(rate_el.text.strip())
  rate_list.append(rate)

for li in this_ul.findAll('li')[0:indexing]:
  rate_el = li.find('span', attrs={'class': 'avgRate'})
  rate = float(rate_el.text.strip())
  rate_list.append(rate)

avg = sum(rate_list) / len(rate_list)
print "avg:", avg