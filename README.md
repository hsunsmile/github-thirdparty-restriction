# github-thirdparty-restriction
Useful scripts to enable github thrid party applications restriction

**Supported**

- [ ] SSH keys created before February 2014 immediately lose access to the organization's resources (this includes user and deploy keys).
- [ ] Hooks created by users and hooks created before May 2014 will not be affected.

**Not supported yet**

- [ ] Hook deliveries from private organization repositories will no longer be sent to unapproved applications.
- [ ] SSH keys created by applications during or after February 2014 immediately lose access to the organization's resources.
- [ ] API access to private organization resources is not available for unapproved applications. In addition, there is no create, update, or delete access to public organization resources.
