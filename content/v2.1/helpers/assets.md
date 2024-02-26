---
title: Assets
order: 40
---

Use these asset helpers to access your asset URLs or generate asset-specific HTML tags within your views.

Each of these helpers expects a "source" to be given. This can be an asset path, or in some cases, also an absolute URL. When given an asset path, the relevant asset will be looked up based on the app or slice in which you're calling the helper.

## asset_url

Returns the URL for given asset source.

```ruby
asset_url("app.js") # => "/assets/app-LSLFPUMX.js"
```

## javascript_tag

Returns a `<script>` tag for the given source, either a JavaScript asset or absolute URL.

```ruby
javascript_tag("app.js")
# => <script src="/assets/app-LSLFPUMX.js" type="text/javascript"></script>

javascript_tag("https://example.com/example.js")
# => <script src="https://example.com/example.js" type="text/javascript"></script>
```

If no file extension is given, then a ".js" extension is added.

```ruby
javascript_tag("app")
# => <script src="/assets/app-LSLFPUMX.js" type="text/javascript"></script>
```

Multiple asset paths can be given to generate multiple script tags at once.

```ruby
javascript_tag("app", "dashboard/app")
# => <script src="/assets/app-LSLFPUMX.js" type="text/javascript"></script>
#    <script src="/assets/dashboard/app-LSLFPUMX.js" type="text/javascript"></script>
```

Provide HTML attributes for the sciprt tag by giving a single source along with keyword arguments.

```ruby
javascript_tag("app", async: true)
# => <script src="/assets/app-LSLFPUMX.js" type="text/javascript" async="async"></script>
```

## stylesheet_tag

Returns a `<link>` tag for the given source, either a stylesheet asset or absolute URL.

```ruby
stylesheet_tag("app.css")
# => <link href="/assets/app-GVDAEYEC.css" type="text/css" rel="stylesheet">

stylesheet_tag("https://example.com/stylesheet.css")
# => <link href="https://example.com/stylesheet.css" type="text/css" rel="stylesheet">
```

If no file extension is given, then a ".css" extension is added.

```ruby
stylesheet_tag("app")
# => <link href="/assets/app-GVDAEYEC.css" type="text/css" rel="stylesheet">
```

Multiple asset paths can be given to generate multiple link tags at once.

```ruby
stylesheet_tag("app", "dashboard/app")
#   # <link href="/assets/application.css" type="text/css" rel="stylesheet">
#   # <link href="/assets/dashboard.css" type="text/css" rel="stylesheet">
```

Provide HTML attributes for the link tag by giving a single source along with keyword arguments.

```ruby
stylesheet_tag("https://example.com/print.css", media: "print")
# => <link href="https://example.com/stylesheet.css" type="text/css" rel="stylesheet" media="print">
```

## image_tag

Returns an `<img>` tag for the given source, either an image asset or absolute URL. Sets the tag's `alt` attribute automatically from the file name.

```ruby
image_tag("logo.png")
# => <img src="/assets/logo-DJHI6WQI.png" alt="Logo">

image_tag("https://example.com/logo.png")
# => <img src="https://example.com/logo.png" alt="Logo">
```

Provide HTML attributes for the tag as keyword arguments.

```ruby
image_tag("logo.png", alt: "App logo", class: "image")
# => <img src="/assets/logo-DJHI6WQI.png" alt="App logo" class="image">
```

## favicon_tag

Returns a `<link>` tag for the given asset source. If none is given, it assumes `"favicon.ico"` to be the asset source.

```ruby
favicon_tag
# => <link href="/assets/favicon-RTK3P5FP.ico" rel="shortcut icon" type="image/x-icon">

favicon_tag("fav.ico")
# => <link href="/assets/fav-EOLTKYGO.ico" rel="shortcut icon" type="image/x-icon">
```

Provide HTML attributes for the tag as keyword arguments.

```ruby
favicon_tag("fav.ico", id: "fav")
# => <link id="fav" href="/assets/fav-EOLTKYGO.ico" rel="shortcut icon" type="image/x-icon">
```

## video_tag

Returns a `<video>` tag for the given source, either a video asset or absolute URL.

```ruby
video_tag("movie.mp4")
# => <video src="/assets/movie-DJHI6WQI.mp4"></video>

video_tag("https://example.com/movie.mp4")
# => <video src="https://example.com/movie.mp4"></video>
```

Provide HTML attributes for the tag as keyword arguments.

```ruby
video_tag("movie.mp4", autoplay: true, controls: true)
# => <video autoplay="autoplay" controls="controls" src="/assets/movie-DJHI6WQI.mp4"></video>
```

Provide a block for the tag's contents. For example, you can use this to supply a fallback message.

```ruby
video_tag("movie.mp4") do
  "Your browser does not support the video tag."
end
# => <video src="/assets/movie-DJHI6WQI.mp4">
#      Your browser does not support the video tag.
#    </video>
```

Or tracks within the video.

```ruby
video_tag("movie.mp4") do
  tag.track(kind: "captions", src: asset_url("movie.en.vtt"), srclang: "en", label: "English")
end
# => <video src="/assets/movie-DJHI6WQI.mp4">
#      <track kind="captions" src="/assets/movie.en-98EA6E4F.vtt" srclang="en" label="English">
#    </video>
```

## audio_tag

Returns an `<audio>` tag for the given source, either an audio asset or absolute URL.

```ruby
audio_tag("song.ogg")
# => <audio src="/assets/song-DJHI6WQI.ogg"></audio>

audio_tag("https://example.com/song.ogg")
# => <audio src="https://example.com/song.ogg"></audio>
```

Provide HTML attributes for the tag as keyword arguments.

```ruby
audio_tag("song.ogg", autoplay: true, controls: true)
# => <audio autoplay="autoplay" controls="controls" src="/assets/song-DJHI6WQI.ogg"></audio>
```

Provide a block for the tag's contents. For example, you can use this to supply a fallback message.

```ruby
audio_tag("song.ogg") do
  "Your browser does not support the audio tag."
end
# => <audio src="/assets/song-DJHI6WQI.ogg">
#      Your browser does not support the audio tag.
#    </audio>
```

Or tracks within the audio.

```ruby
audio_tag("song.ogg") do
  tag.track(kind: "captions", src: asset_url("movie.en.vtt"), srclang: "en", label: "English")
end
# => <audio src="/assets/song-DJHI6WQI.ogg">
#      <track kind="captions" src="/assets/movie.en-98EA6E4F.vtt" srclang="en" label="English">
#    </audio>
```
