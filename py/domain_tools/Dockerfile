# Use an official base image with micromamba pre-installed
FROM mambaorg/micromamba:latest

# Set the working directory to /app/src
WORKDIR /app/src

# Install necessary packages and set up the environment
RUN micromamba create -c conda-forge -n bd_env python=3.9 -y && \
    micromamba install -n bd_env -c conda-forge numpy scipy rdkit gemmi meeko cctbx-base pymol-open-source vina -y

# Install pip in the environment
RUN micromamba run -n bd_env pip install --upgrade pip

# Install Flask using pip within the micromamba environment
RUN micromamba run -n bd_env pip install flask

# Install git and build tools as root
USER root
RUN apt-get update && apt-get install -y git build-essential

# Copy the src folder into the container
COPY src/ /app/src/

# Clone additional repositories and install using pip
RUN micromamba run -n bd_env git clone --single-branch --branch develop https://github.com/ToolProof/molscrub.git && \
    micromamba run -n bd_env pip install --use-pep517 -e molscrub

RUN git clone https://github.com/ToolProof/geostd.git

# Install latest version of Meeko for reactive docking support
RUN micromamba run -n bd_env pip install git+https://github.com/forlilab/Meeko.git

# RUN git clone --branch docwork --depth=1 --filter=tree:0 https://github.com/rwxayheee/Meeko.git && \
    # cd Meeko && git sparse-checkout set --no-cone example && git checkout

# Install ProDy within the micromamba environment
RUN micromamba run -n bd_env pip install prody

# Install google-cloud-storage within the micromamba environment
RUN micromamba run -n bd_env pip install google-cloud-storage

# Install langchain and langchain-openai within the micromamba environment
RUN micromamba run -n bd_env pip install langchain langchain-openai

# Expose ports
EXPOSE 8080

# Set the command to run your Python script when the container starts
CMD ["micromamba", "run", "-n", "bd_env", "python", "main.py"]
