# PINAWeb Motivation

 During the last 15 years, many protein-protein interaction network (PPIN) aligners have been developed with the main aim at helping to the functional annotation of proteins and the prediction of protein-protein interactions. However, despite these efforts, no such aligner has attained so far  the right balance between the preservation of the networks' topology and of the biological information in its PPIN alignments. As a consequence, the choice of the "right" alignment tool depends on the purpose of the alignment itself.

To help researchers to choose alignments that suit their needs, we introduce PINAWeb, a web-based tool to perform PPIN pairwise alignments using a set of different aligners: the currently implemented ones are AligNet, HubAlign, LGraal, Pinalog and Spinal. The PPIN can be either loaded from a database or uploaded by the user.  The tool outputs the alignments produced by the aligners chosen by the user, together with several associated topological and biological correctness scores, as well as, a consensus alignment when more than one aligner is chosen. The source code is freely available on the GitHub, and any interested researcher can easily add new aligners, new network databases or new alignment score metrics to the tool, which makes PINAWeb suitable to compare different aligners.


# PINAWeb architecture

PINAWeb is organized under the philosophy of microservices instead of a monolithic architecture. PINAWeb's architecture is divided into three main layers: the front-end (https://github.com/biocom-uib/util-aligner-web), the REST API (https://github.com/biocom-uib/util-aligner-api), and the server (https://github.com/biocom-uib/util-aligner-server). Then, we use connectors to link these layers.


# How the front-end works

The user interacts with PINAWeb through the front-end. This front-end has a layer of css that uses Bootstrap 4 to improve the user experience (UX) and user interface (UI), and it uses JavaScript to interact with the REST API through HTTP requests. Its main flow is then:
* The front-end sends a GET request to the REST API to know which databases and aligners are available and it displays them
at the corresponding interface selector.
* When the user chooses a database, the front-end asks to the REST API which PPIN are available using another GET request and it displays them at the corresponding interface selector.
* Finally, once the user has chosen the database, the aligner(s), and the networks, the front-end sends a POST request to the REST API with all this information and the user's email and it shows a message to the user explaining that an email will be sent with the results.


# Contributing

##  Steps to add a new aligner in PINAWeb
In the server (https://github.com/biocom-uib/util-aligner-server) you need to:
* Add the aligner template (executable and required files) to `aligners-templates/template-new_aligner`.
* Add a new module to the `server/aligners/` directory with a class inheriting from `Aligner`.
* Reference this new class in `aligners.json`.
* Populate the DB (to be queried by the API) with `update_mysql.py`.


##  Steps to add a new score in PINAWeb
In the server (https://github.com/biocom-uib/util-aligner-server) you need to do:
* Implement the new score in `scores.py` or a new module. Then call it from `compute_scores` in `scores.py`.
* If the new scoring function returns (even potentially) large results, split them into separate files in `split_score_data_as_tsvs` (again from `scores.py`).

And in the API (https://github.com/biocom-uib/util-aligner-api):
* If needed, adapt the function `write_scores_result_files` in `api/email.py` to add related attachments or graphics. You can use the function `prepare_attachment_tsv`.
* Adapt the email templates that can be found in `templates` to include new text in the email body.


Once you have done all of this you can create a pull request with this changes and if everything is correct we will add your aligner to our website. To add a new database we also need a reproducible script to add the data to our database.
