Task:
Match and group websites by the similarity of their logos.

In my aproach i started by doing some research on the subject.I had never done such a task before, so it was a bit of a challenge.

I had to consider wheter i should compare the logos online or to download them and then do it. I decided that it was best to first download them because if i want multiple comparisons it would take a lot of time to do it over and over again, and also if i introduce a separate logo that i want to compare, i would be forced to repeat the long process of accesing every website.

To get the logos i first found the library cheerio, but then decided to use puppeteer, as i found it to be much easier to understand for myself.

As for the image comparison, this was a little tricky. I first found about resembleJs as a tool, but i later understood that it compares images pixel by pixel and for my task, needing to compare it from a human perspective or at least close to one, i didn't tought it will be a good choice. So after a little more research i found about perceptual hash, and that this might be a better choice, due to it's ability to "get the general ideea of the image" (not the best way to explain it) or the image fingerprint.

As for the websites, i managed to get about 2000 logos from the websites, some of them didn't work.

I've also added an html file to visualize the grouped logos from the comparison. Just press the button after you've generated the json file and it will map the list.

With this application you can compare images/logos and group them by how similar they are with each other.

It generates the perceptual hash of each image and then compares the hamming distance to decide wheter or not two images are similar.

For reading the file with the links:

```
  const websites = await readData("./logos.snappy.parquet");
```

To download the logos:

```
  await downloadLogo(websites, logosDir);
```

To normalize all the logos:

```
  normalizeLogos(logosDir, normalizedDir);
```

To generate the phash, compare it with all the files then store it.

```
  const hashList = await generateImageHashes(normalizedDir);
  await compareImages(hashList);
```
