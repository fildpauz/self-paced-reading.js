# JESPR
A javascript library for conducting browser-based self-paced reading experiments.

## Overview

JESPR is a javascript library that is designed to help language researchers to conduct self-paced reading experiments (i.e., as described in Just, Carpenter, and Woolley 1982 [[1][]]) through a browser interface. JESPR is compatible with all modern browsers that can process javascript and can be set up to run on a local machine, or remotely, enabling the possibility of gathering data through crowd-sourcing services. The experimental procedure and interface is highly customizable and data output can be easily imported into analysis applications such as Excel or R. Development is ongoing, and future plans include adding capability for touch-enabled and small form-factor screens.

## Motivation

There are already a wide variety of powerful applications for conducting self-paced reading experiments (e.g., [[2][]], [[3][]], [[4][]]). Many of these will interface with high-resolution hardware keypads for highly sensitive reaction-time measurements. But not all self-paced reading experiments require such high resolution. Furthermore, these applications typically require local installation and active management by the experimenter for each experimental participant. Recently, though, linguists are finding it useful to conduct experiments and gather data through on-line web-forms and applications or through crowd-sourcing services.

Recent work [[5][]] has even shown that self-paced reading experiments can be conducted via Amazon's Mechanical Turk crowd-sourcing service and can generate reliable observations of some well-known experimental effects. As yet, however, there are very few Javascript-based solutions for conducting self-paced reading experiments via a web browser (but see [[6][]] for one solution) ([[5][]]'s work used Flash technology, which is seeing [waning support](https://en.wikipedia.org/wiki/Adobe_Flash#Criticisms) by browser developers), but with the advent of HTML5, Javascript-based solutions are becoming commonplace. JESPR is my attempt to contribute to a Javascript solution for conducting self-paced reading experiments.

Hence, JESPR stands for "Javascript-Enabled Self-Paced Reading".

## Getting started with JESPR

In order to use JESPR, there are four files you will need to be aware of.

* `jesper-library.js` -- This is the main library file. If you just want to run experiments, then you should never even have to open this file; just make the appropriate references to it in the `html` file.
* `jespr.html` -- This is the file that would be loaded into the browser and contains the appropriate references to the JESPR library, stylesheet, and design file, and also contains the code to launch the experiment. The body of this file may be edited to add some pre-experiment or post-experiment content, as desired; say, a consent form, or a post-experiment debriefing text.
* `jesper.css` -- This is the stylesheet for the design and layout of various elements in the operation of JESPR. This should probably not be edited unless you know what you're doing.
* `jesper-sample1.js` -- This is the core of the experiment and the most important file for the experimenter. This file sets the global parameters of the experiment as well as lists all of the experimental stimuli.

In `jespr.html`, the other three files are referenced in the `<HEAD>` section as follows.

```
<script src="jespr-sample1.js"></script>
<script src="jespr-library.js"></script>
<link href="jesper.css" rel="stylesheet" type="text/css"/>
```

When running an experiment locally, the four files could be placed in the same directory and the `jesper.html` file could be opened in a browser and run without any Internet connection. However, for a remote administration, some changes may be necessary depending on the situation. Following are a couple of likely scenarios.

* _Host all the files on a web server._ Actually, this is pretty easy -- Put all the files in the same directory on the web server and then leave the references as above.
* _Conduct an experiment via Mechanical Turk._ MT does not allow the uploading of additional files, so they would have to be hosted on a separate server. In this case, the `<HEAD>` references above would need to be updated to give the full URI path to where the files are located. An alternative solution would be to copy the contents of the three files into the source `html` of the MT HIT. This should be attempted only by those who know what they are doing.

## Designing a JESPR experiment

The main task of getting a JESPR experiment ready is to create the design file (e.g., `jesper-sample1.js` above). The design file must be laid out using the JSON (JavaScript Object Notation) data format. If this is not familiar to you, a gentle introduction can be found at the W3C Schools. For those not confident with how to construct and error-check JSON format, it may be useful to use an editor. A search for "json editor" or "json online editor" will yield several good options.

===

The following sections explain how to organize the design file as well as what setting options are available and what they do. Those marked with an asterisk (*) are required in the design file.

### title

This is the title of the experiment and will be shown on an obligatory title screen together with the investigators names below.

### investigators

This is a list of the investigators and will be displayed on the title screen. the `primary` investigators will be listed first and in bold face and `other` investigators will listed afterward in the normal font face.

### font-name (default: `Courier new`)

The name of the desired font to be used as the base font for all text in the experiment. The actual font used will be somewhat browser and system-dependent, so using a web-safe font (e.g., Arial, Times New Roman) is recommended.

### font-size (default: `12`)

The size of the font in `pt` units (but without the units). While any desired font size setting is possible, experimenters should confirm that their selected font size does not result in wrapping of stimulus sentences (which might produced systematic latencies in keypress timings).

### text-color (default: `black`)

The color of all text in the experiment (with the optional exception of feedback; see below). Colors are limited to one of the 147 HTML valid color names (e.g., http://www.w3schools.com/colors/colors_hex.asp).

### background-color (default: `white`)

The color of the screen background throughout the experiment. Colors are limited to one of the 147 HTML valid color names (e.g., http://www.w3schools.com/colors/colors_hex.asp).

### display (default: `moving window`)

This determines how the regions of each stimulus item will be displayed:

* `moving window` -- As each region is unmasked, the previously displayed window is masked, yielding a display where only one region is visible at a time.
* `cumulative` -- Unmasked regions remain unmasked for the continuation of the stimulus.

### orientation (default: `horizontal`)

This determines the orientation of the stimulus regions.

* `horizontal` -- The regions are arranged on a single line, horizontally. This would be the typical arrangement for stimuli where the entire stimulus is one sentence, and each region is one (or more) words.
* `vertical` -- The regions are arranged vertically, in the center of the screen. This would be teh typical arrangement for stimuli that are, say, short stories, and each region is one sentence in the story.

### masking-character (default: `_`)

This is the character that will be used to mask each region, by substituting the character for all non-whitespace characters (including punctuation) within the region. Note that different potential masking characters (e.g., `_`, `*`, `X`) will have different widths in different fonts and could result in some unusual display effects during the experiment. Therefore, carefully consider `font-name`, `font-size`, and `masking-character` together.

### fixation-character (default: `+`);

At the beginning of each stimulus item, a fixation character will be displayed as is typical in self-paced reading experiments. The selected fixation character will be presented at a font-size approximately 5 times the normal font size.

### min-instruction-time (default: `3000` milliseconds)

In order to prevent participants from accidentally jumping pasts instruction screens that they need to read, this value sets a minimum amount of time that the screen must remain visible before the experiment may proceed. Hence, it effectively disables the advancement of the experiment for the specified number of milliseconds.  This might also be set to a much higher number (e.g., `60000` for one minute) in order to ensure that participants spend enough time on the instructions.

### feedback-options

Feedback to the experimental participant may be given during the experiment regarding their responses to optional post-stimulus prompts (e.g., comprehension questions). `feedback-options` is the place to define one or more generic feedback options that may be used through the experiment. Each option has three parameters, as follows.

* `name` * -- the name of the option. This is used within the design file to indicate which responses should receive which feedback-option. This name is never displayed to the experimental participant, but will be used in the data output to indicate which feedback was given.
* `string` * -- the actual feedback to be given to the participant (e.g., _That's correct_, _That's not correct_).
* `text-color` -- The (optional) color in which the feedback text will be displayed (e.g., `red` for _That's not correct_). Colors are limited to one of the 147 HTML valid color names (e.g., http://www.w3schools.com/colors/colors_hex.asp).

===

The procedure of a JESPR experiment is as follows, where the obligatory items are marked with an asterisk (*).

* Title screen *
* Instruction screens
* Practice item screens
* Post-practice instruction screens
* Experimental item screens *
* Post-experiment instruction screens

The following sections explain how each of these items are described in the design file.

### Title screen *

As explained above, the title screen will be constructed automatically from the values give for `title` and the list of values for `investigators`.

### Instruction screens

Instruction screens are screens of static text which are displayed at the beginning of the experiment immediately after the title screen. In the design file, the screens are listed as an array of objects. Each object has just one reference, `instruction-screen`, the value of which is to be displayed as one screen. The value will be inserted into the screen exactly as is and may therefore contain minimal `html` mark-up. For example, `<p>`  can be used to mark paragraphs and `<br>` for line breaks. Furthermore, styling can be done with `<b>` for bold, `<i>` for italicized, and `<u>` for underlined text. [Note: At the moment, other `html` tags can be used, but this will be locked down in future versions of JESPR for security purposes.]

Instruction screens will be visible for the minimum amount of time specified in the `min-instruction-time` setting.

### Practice stimuli screens

Optionally, experimenters may want participants to go through a certain number of practice items before beginning the experiment. The `practice-stimuli` reference is the place to format these. The `order` value takes two options, either `fixed` or `random` and determines whether the set of practice stimuli will be presented in the order given, or randomized for each participant. The `items` value is simply an array of `item` objects, each describing one experimental stimulus item. Each item has the following settings (obligatory items marked with asterisk (*)).

* `id` * -- an identifier for this experimental item. The identifier must be unique and have the the following structure: (i) starts with a letter, (ii) ends with a letter or number, (iii) and has zero or more letters or numbers of symbols (`_`, `.`, `-` only) in the middle. For example, `item.5`, `s8`, and `my_Filler` are all valid. These identifiers will be used in the data output for quick identification of results.
* `string` * -- The stimulus to be presented on screen. Regions should be separated by a vertical bar; for example, `Every|good|boy|does|fine.` or `John hit Matt.|He was angry.` Most experiments have a particular region of interest. This can be highlighted in the design file with curly braces: `Every|good|boy|[does]|fine.` This has no effect on the presentation of the stimulus, but the position of all regions relative to the region of interest (i.e., an integer: 0 for the region of interest, negative integers for preceding regions and positive integers for following regions) will be included in the output results for easy analysis of results.
* `prompt` -- After each stimulus item, it is possible to give a follow-up prompt (e.g., a comprehension question or linguistic judgment). The prompt text will be displayed as plain text.
* `options` -- Together with the prompt, two response options will be presented. The `options` reference is an array of these option objects with the following parameters: `string` is the option to be displayed; `feedback-option` is the `name` value of the experiment-wide feedback-option defined earlier in the design file. The specified feedback-option will be shown when the respective option is selected by the participant. As an alternative to the experiment-wide feedback-option, feedback specific to the current item may be specified with `feedback` instead of `feedback-option`. In this case, the `text-color` may also be specified. If both a `feedback-option` and `feedback` are specified, the `feedback-option` will take precedence.
* `tags` -- An array of tags can be provided to each specific stimulus item. These tags are not displayed to participants, but are output in the results and can be used afterward for data analysis. For instance, the tags may identify certain experimental conditions or variables for post-hoc analysis.

### Post-practice instruction screens

After the practice items, there may be one or more further instructions before the experiment proper begins. These follow the same format and display conditions as _Instruction screens_ above.

### Experimental stimuli screens *

The experimental stimuli items can be defined as described above for the practice stimuli. However, these items can be organized into groups and then stimulus sets. For example, one experiment might might contain different stimuli sets that test different hypotheses.  And then each set may contain different groups that test different experimental conditions. For both the stimuli as a whole and for stimuli sets, the following options can be specified.

* `order` -- specifies whether the sets/groups should be presented in either a `random` or `fixed` order. The default value is `fixed*`.
* `merge` -- specifies whether the sets/groups should be merged or not. The default value is `false`. If `true` is specified, the given sets/groups will be merged with each other in a random manner.

The `order` and `merge` settings cascade downward.  That is, if only the stimuli-sets `order` setting is `random`, and none of the sets or groups are specified, `random` will be taken as the specified value.

Both `stimuli-set` and `group` should specify a `name` value. This name is not displayed to participants, but is output with the results. Thus, the name can specify certain experimental conditions or stimuli types (e.g., `filler`, etc.).  Thus, these names, in combination with the individual item `tags` make it possible to categorize the results clearly beforehand and enable rapid analysis of results afterward.

The specification for individual groups is as described for practice-stimuli above.

### Post-experiment instruction screens

After the experiment, there may be one or more final instructions or information to give the participants. These follow the same format and display conditions as _Instruction screens_ above.

## Data output



## References

1. Just, M. A., Carpenter, P. A., & Woolley, J. D. 1982. [Paradigms and processes in reading comprehension](http://www.ncbi.nlm.nih.gov/pubmed/6213735). _Journal of Experimental Psychology: General_, Vol 111: 228-238.
2. [Superlab](http://www.superlab.com/) by Cedrus Corporation
3. [E-Prime](https://www.pstnet.com/eprime.cfm) by Psychology Software Tools, Inc.
4. [DMDX Display Software](http://www.u.arizona.edu/~kforster/dmdx/dmdx.htm) by Kenneth Forster
5. Enochson K, Culbertson J (2015) [Collecting Psycholinguistic Response Time Data Using Amazon Mechanical Turk](http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0116946). _PLoS ONE_ 10(3): e0116946. doi:10.1371/journal.pone.0116946
6. [Ibex self paced reading experiment](https://github.com/hlplab/hlpspr1) by Human Language Processing Lab

[1]: http://www.ncbi.nlm.nih.gov/pubmed/6213735 "Just, M. A., Carpenter, P. A., & Woolley, J. D. 1982. Paradigms and processes in reading comprehension. _Journal of Experimental Psychology: General_, Vol 111: 228-238."
[2]: http://www.superlab.com/ "Superlab by Cedrus Corporation"
[3]: https://www.pstnet.com/eprime.cfm "E-Prime by Psychology Software Tools, Inc."
[4]: http://www.u.arizona.edu/~kforster/dmdx/dmdx.htm "DMDX Display Software by Kenneth Forster"
[5]: http://journals.plos.org/plosone/article?id=10.1371/journal.pone.0116946 "Enochson K, Culbertson J (2015) Collecting Psycholinguistic Response Time Data Using Amazon Mechanical Turk. _PLoS ONE_ 10(3): e0116946. doi:10.1371/journal.pone.0116946"
[6]: https://github.com/hlplab/hlpspr1 "Ibex self paced reading experiment by Human Language Processing Lab"