#!/bin/csh

/home/dullwebe/KNIME//knime -nosplash -application org.knime.product.KNIME_BATCH_APPLICATION  -workflowFile=<ZIP_FILE_OF_WORKFLOW> -data /home/dullwebe/knime-workspace -reset -nosave -vmargs -Dhttp.proxyHost=<HOSTNAME> -Dhttp.proxyPort=8080 >>& <NAME_OF_LOG_FILE_OPTIONAL>

