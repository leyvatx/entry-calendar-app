FROM ruby:3.3.12-trixie

WORKDIR /data

RUN apt-get update -y && apt-get install -y npm sqlite3 libsqlite3-dev

RUN npm install --global yarn

COPY Gemfile* ./

RUN bundle install

COPY . .

CMD ["rails", "db:setup"]
