from lxml import html
import requests
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

this_page = requests.get(this_url)
this_tree = html.fromstring(this_page.content)

last_page = requests.get(last_url)
last_tree = html.fromstring(last_page.content)

this_rates = this_tree.xpath('//*[@id="content"]/div[1]/div/div[1]/div/ul[1]/li/span[2]/text()')
last_rates = last_tree.xpath('//*[@id="content"]/div[1]/div/div[1]/div/ul[1]/li/span[2]/text()')

rate_list = []
for rate in this_rates[0:indexing]:
  rate_list.append(float(rate))

for rate in last_rates[indexing:]:
  rate_list.append(float(rate))

avg = sum(rate_list) / len(rate_list)
print "avg:", avg