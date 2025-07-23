# 🔒 Security Guide - Google Maps API Key Management

## ⚠️ **Current Issue: Publicly Accessible API Key**

Your Google Maps API key is currently exposed and needs to be secured to prevent:
- **Unauthorized usage** and quota exhaustion
- **Potential billing charges** from abuse
- **Security vulnerabilities** in your application

## 🛡️ **Immediate Security Fixes**

### **1. Configure API Key Restrictions**

**Go to:** [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)

#### **Step 1: Find Your API Key**
1. Select your project: `backpackers-90876`
2. Navigate to "APIs & Services" → "Credentials"
3. Find your API key in the list

#### **Step 2: Add Application Restrictions**
Click on your API key and configure:

**HTTP referrers (web sites):**
```
localhost:*
localhost:5173/*
localhost:3000/*
yourdomain.com/*
*.yourdomain.com/*
```

#### **Step 3: Add API Restrictions**
Restrict the key to only these APIs:
- ✅ Maps JavaScript API
- ✅ Places API  
- ✅ Directions API

### **2. Environment Configuration**

#### **Development (.env file):**
```env
# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

#### **Production (.env.production):**
```env
# Production API key with stricter restrictions
VITE_GOOGLE_MAPS_API_KEY=your_production_api_key_here
```

### **3. Deployment Security**

#### **For Vercel:**
1. Add environment variable in Vercel dashboard
2. Set domain restrictions to your Vercel domain
3. Never commit API keys to git

#### **For Netlify:**
1. Add environment variable in Netlify dashboard
2. Set domain restrictions to your Netlify domain
3. Use build-time environment variables

## 🔐 **Best Practices**

### **1. Never Commit API Keys**
```bash
# ✅ Good - .env is in .gitignore
echo ".env" >> .gitignore

# ❌ Bad - Never do this
git add .env
git commit -m "Add API key"
```

### **2. Use Different Keys for Environments**
- **Development**: Restricted to localhost
- **Staging**: Restricted to staging domain
- **Production**: Restricted to production domain

### **3. Monitor API Usage**
- Set up billing alerts in Google Cloud Console
- Monitor API quotas and usage
- Set up usage notifications

### **4. Regular Security Audits**
- Review API key permissions monthly
- Remove unused API keys
- Update domain restrictions as needed

## 🚨 **Emergency Actions**

### **If Your Key is Compromised:**
1. **Immediately disable** the compromised key
2. **Create a new key** with proper restrictions
3. **Update all environments** with the new key
4. **Monitor for unauthorized usage**

### **Quick Fix Commands:**
```bash
# Check if .env is in .gitignore
grep -q ".env" .gitignore && echo "✅ .env is protected" || echo "❌ Add .env to .gitignore"

# Verify no API keys in git history
git log --all --full-history -- .env

# Remove .env from git if accidentally committed
git rm --cached .env
git commit -m "Remove .env file from tracking"
```

## 📋 **Security Checklist**

- [ ] API key has domain restrictions
- [ ] API key has API restrictions
- [ ] .env file is in .gitignore
- [ ] No API keys in git history
- [ ] Different keys for dev/staging/prod
- [ ] Billing alerts configured
- [ ] Usage monitoring enabled
- [ ] Regular security reviews scheduled

## 🔗 **Useful Links**

- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Security Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)

## 📞 **Support**

If you need help with API key security:
1. Check Google Cloud Console documentation
2. Review Google Maps API security guidelines
3. Contact Google Cloud support if needed

---

**Remember: API key security is crucial for protecting your application and preventing unauthorized usage!**