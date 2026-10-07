module TextNormalizer
  def self.call(text)
    text.to_s.unicode_normalize(:nfd).gsub(/\p{Mn}/, "").downcase.squish
  end
end
