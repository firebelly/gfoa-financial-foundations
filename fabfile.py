from fabric.api import *
import os

env.hosts = ['gfoa-financial-foundations.firebelly.co']
env.user = 'firebelly'
env.path = '~/Sites/gfoa-financial-foundations'
env.remotepath = '/home/firebelly/webapps/gfoa_financial_foundations'
env.git_branch = 'master'
env.warn_only = True
env.remote_protocol = 'http'

# def production():
#   env.hosts = ['gfoa.org']
#   env.user = 'starthereuser'
#   env.remotepath = '/path/to/site'
#   env.git_branch = 'master'
#   env.remote_protocol = 'https'

def build():
  local('npx gulp --production')

def deploy():
  update()

def update():
  with cd(env.remotepath):
    run('git pull origin {0}'.format(env.git_branch))
